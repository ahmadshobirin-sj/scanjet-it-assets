<?php

namespace App\Http\Services;

use App\Http\Resources\MediaItemResource;
use App\Models\MediaLibrary;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class MediaLibraryService
{
    private bool $usePolicies = false;

    public function __construct()
    {
        $this->usePolicies = (bool) config('media-library.use_policies', false);
    }

    public function authz(string $ability, mixed $subject = null): void
    {
        if (! $this->usePolicies) {
            return;
        }
        if ($subject) {
            Gate::authorize($ability, $subject);
        } else {
            Gate::authorize($ability, Media::class);
        }
    }

    /** Map 'product' → App\Models\Product via morphMap; atau validasi FQCN. */
    private function normalizeTargetType(string $type): string
    {
        $map = Relation::morphMap() ?: [];
        if (isset($map[$type])) {
            return $map[$type];
        }
        abort_unless(class_exists($type), 422, 'Invalid target_type');

        return $type;
    }

    private function allowedFilters(): array
    {
        return [
            AllowedFilter::callback('search', function (EloquentBuilder $q, $v) {
                $v = (string) $v;
                $q->where(
                    fn ($qq) => $qq->where('name', 'like', "%{$v}%")
                        ->orWhere('file_name', 'like', "%{$v}%")
                        ->orWhere('mime_type', 'like', "%{$v}%")
                );
            }),
            AllowedFilter::callback('mime_prefix', fn (EloquentBuilder $q, $v) => $q->where('mime_type', 'like', ((string) $v).'%')),
            // filter koleksi milik Spatie
            AllowedFilter::callback('collection', fn (EloquentBuilder $q, $v) => $q->where('collection_name', (string) $v)),
            AllowedFilter::callback('created_from', fn (EloquentBuilder $q, $v) => $q->whereDate('created_at', '>=', (string) $v)),
            AllowedFilter::callback('created_to', fn (EloquentBuilder $q, $v) => $q->whereDate('created_at', '<=', (string) $v)),
        ];
    }

    private function allowedSorts(): array
    {
        return ['id', 'name', 'size', 'created_at'];
    }

    /** GLOBAL library list (media milik MediaLibrary) */
    public function libraryQB(int $page = 1, int $perPage = 24): LengthAwarePaginator
    {
        $this->authz('media_library.viewAny');

        $builder = QueryBuilder::for(Media::class)
            ->where('model_type', MediaLibrary::class)
            ->allowedFilters($this->allowedFilters())
            ->allowedSorts($this->allowedSorts())
            ->defaultSort('-id');

        return $builder->paginate(
            min(max($perPage, 1), 100),
            ['*'],
            'page',
            max($page, 1)
        )->appends(request()->query());
    }

    /** Upload single → GLOBAL library (Spatie collection tetap dipakai) */
    public function uploadToLibrary(UploadedFile $file, string $collection = 'default'): array
    {
        $this->authz('media_library.create');

        DB::beginTransaction();
        /** @var Media|null $media */
        $media = null;

        try {
            $row = MediaLibrary::create();

            $media = $row->addMedia($file->getRealPath())
                ->usingFileName($file->getClientOriginalName())
                ->toMediaCollection($collection);

            DB::commit();

            return $this->transform($media);
        } catch (\Throwable $e) {
            DB::rollBack();
            if ($media && $media->exists) {
                try {
                    $media->delete();
                } catch (\Throwable $ignored) {
                }
            }
            throw $e;
        }
    }

    /** Upload multiple → GLOBAL library; skip item jika clamav gagal. */
    public function uploadManyToLibrary(array $files, string $collection = 'default', bool $scanEnabled = false): array
    {
        $uploaded = [];
        $skipped = [];

        foreach ($files as $file) {
            if (! ($file instanceof UploadedFile)) {
                continue;
            }

            if ($scanEnabled) {
                $v = Validator::make(['file' => $file], ['file' => ['required', 'file', 'clamav']]);
                if ($v->fails()) {
                    $skipped[] = [
                        'name' => $file->getClientOriginalName(),
                        'reason' => 'clamav_failed',
                        'message' => $v->errors()->first('file'),
                    ];

                    continue;
                }
            }

            $uploaded[] = $this->uploadToLibrary($file, $collection);
        }

        return [
            'uploaded' => $uploaded,
            'count' => count($uploaded),
            'skipped' => $skipped,
            'skipped_count' => count($skipped),
        ];
    }

    /** Link media (Spatie media IDs) → target model via pivot, TANPA copy file. */
    public function linkByMediaIds(string $targetType, string $targetId, array $mediaIds, string $pivotCollection = 'default'): int
    {
        $targetType = $this->normalizeTargetType($targetType);

        return DB::transaction(function () use ($targetType, $targetId, $mediaIds, $pivotCollection) {
            $map = Media::query()
                ->whereIn('id', array_filter($mediaIds, 'is_numeric'))
                ->where('model_type', MediaLibrary::class)
                ->pluck('model_id', 'id');

            $now = now();
            $rows = [];
            foreach ($mediaIds as $mid) {
                $lib = $map[$mid] ?? null;
                if (! $lib) {
                    continue;
                }
                $rows[] = [
                    'id' => (string) Str::uuid(),     // <-- penting
                    'media_library_id' => (string) $lib,
                    'linkable_type' => $targetType,
                    'linkable_id' => (string) $targetId,
                    'collection_name' => $pivotCollection,
                    'order_column' => null, // atau hitung max+1 kalau mau
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            if ($rows) {
                DB::table('media_links')->upsert(
                    $rows,
                    ['media_library_id', 'linkable_type', 'linkable_id', 'collection_name'],
                    ['updated_at'] // jangan update id/order_column by default
                );
            }

            return count($rows);
        });
    }

    /** Unlink media dari target (hapus pivot). */
    public function unlinkByMediaIds(string $targetType, string $targetId, array $mediaIds, ?string $pivotCollection = null): int
    {
        $targetType = $this->normalizeTargetType($targetType);

        return DB::transaction(function () use ($targetType, $targetId, $mediaIds, $pivotCollection) {
            $libraryIds = Media::query()
                ->whereIn('id', array_filter($mediaIds, 'is_numeric'))
                ->where('model_type', MediaLibrary::class)
                ->pluck('model_id');

            $q = DB::table('media_links')
                ->whereIn('media_library_id', $libraryIds)
                ->where('linkable_type', $targetType)
                ->where('linkable_id', (string) $targetId);

            if ($pivotCollection !== null) {
                $q->where('collection_name', $pivotCollection);
            }

            return $q->delete();
        });
    }

    /**
     * List media yang ter-link ke target.
     * - $pivotCollection: filter role di pivot (media_links.collection_name)
     * - $mediaCollection: filter koleksi di tabel media (media.collection_name milik Spatie)
     */
    public function listLinked(string $targetType, string $targetId, ?string $pivotCollection = null, ?string $mediaCollection = null): array
    {
        $targetType = $this->normalizeTargetType($targetType);

        $libraryIds = DB::table('media_links')
            ->where('linkable_type', $targetType)
            ->where('linkable_id', (string) $targetId)
            ->when($pivotCollection, fn ($q) => $q->where('collection_name', $pivotCollection))
            ->pluck('media_library_id');

        $items = Media::query()
            ->where('model_type', MediaLibrary::class)
            ->whereIn('model_id', $libraryIds)
            ->when($mediaCollection, fn ($q) => $q->where('collection_name', $mediaCollection))
            ->get();

        return $this->transformCollection($items);
    }

    /** Delete satu file (hapus owner MediaLibrary → file fisik ikut terhapus). */
    public function deleteMediaByMediaId(int $mediaId): void
    {
        $media = Media::findOrFail($mediaId);
        $this->authz('media_library.delete', $media);

        DB::transaction(function () use ($media) {
            MediaLibrary::find((string) $media->model_id)?->delete();
        });
    }

    /** Bulk delete by Spatie media IDs. */
    public function deleteManyByMediaIds(array $ids): int
    {
        $ids = array_values(array_filter($ids, 'is_numeric'));
        if (! $ids) {
            return 0;
        }

        return DB::transaction(function () use ($ids) {
            $medias = Media::query()
                ->whereIn('id', $ids)
                ->where('model_type', MediaLibrary::class)
                ->get();

            $count = 0;
            foreach ($medias as $m) {
                $this->authz('media_library.delete', $m);
                MediaLibrary::find((string) $m->model_id)?->delete();
                $count++;
            }

            return $count;
        });
    }

    public function syncLinksByMediaIds(
        string $targetType,
        string $targetId,
        array $mediaIds,
        string $pivotCollection = 'default',
        bool $preserveExistingOrder = false
    ): array {
        $targetType = $this->normalizeTargetType($targetType);

        // bersihkan input
        $mediaIds = array_values(array_unique(array_filter($mediaIds, 'is_numeric')));

        // map media.id -> media_library_id (UUID)
        $libMap = Media::query()
            ->whereIn('id', $mediaIds)
            ->where('model_type', MediaLibrary::class)
            ->pluck('model_id', 'id'); // [media_id => library_uuid]

        $desiredLibIds = [];
        foreach ($mediaIds as $mid) {
            $libId = $libMap[$mid] ?? null;
            if ($libId) {
                $desiredLibIds[] = (string) $libId;
            }
        }

        return DB::transaction(function () use ($targetType, $targetId, $pivotCollection, $desiredLibIds, $preserveExistingOrder) {
            $existingLibIds = DB::table('media_links')
                ->where('linkable_type', $targetType)
                ->where('linkable_id', (string) $targetId)
                ->where('collection_name', $pivotCollection)
                ->pluck('media_library_id')
                ->map(fn ($v) => (string) $v)
                ->all();

            $toAttach = array_values(array_diff($desiredLibIds, $existingLibIds));
            $toDetach = array_values(array_diff($existingLibIds, $desiredLibIds));

            // detach yang tidak ada di payload baru
            $detached = 0;
            if ($toDetach) {
                $detached = DB::table('media_links')
                    ->whereIn('media_library_id', $toDetach)
                    ->where('linkable_type', $targetType)
                    ->where('linkable_id', (string) $targetId)
                    ->where('collection_name', $pivotCollection)
                    ->delete();
            }

            $now = now();
            $attached = 0;
            $reordered = 0;

            if ($preserveExistingOrder) {
                // hanya INSERT baru di belakang (tidak mengubah order yang sudah ada)
                if ($toAttach) {
                    $max = DB::table('media_links')
                        ->where('linkable_type', $targetType)
                        ->where('linkable_id', (string) $targetId)
                        ->where('collection_name', $pivotCollection)
                        ->max('order_column');
                    $next = is_null($max) ? 1 : (int) $max + 1;

                    $rows = [];
                    foreach ($toAttach as $libId) {
                        $rows[] = [
                            'id' => (string) Str::uuid(),   // <-- penting
                            'media_library_id' => $libId,
                            'linkable_type' => $targetType,
                            'linkable_id' => (string) $targetId,
                            'collection_name' => $pivotCollection,
                            'order_column' => $next++,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ];
                    }

                    // upsert dengan unique key di 4 kolom; update hanya kolom aman
                    DB::table('media_links')->upsert(
                        $rows,
                        ['media_library_id', 'linkable_type', 'linkable_id', 'collection_name'],
                        ['updated_at'] // jangan update id/order_column utk preserve mode
                    );
                    $attached = count($rows);
                }
            } else {
                // override urutan penuh sesuai $desiredLibIds
                $rows = [];
                foreach ($desiredLibIds as $idx => $libId) {
                    $rows[] = [
                        'id' => (string) Str::uuid(),  // <-- penting
                        'media_library_id' => $libId,
                        'linkable_type' => $targetType,
                        'linkable_id' => (string) $targetId,
                        'collection_name' => $pivotCollection,
                        'order_column' => $idx + 1,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }

                DB::table('media_links')->upsert(
                    $rows,
                    ['media_library_id', 'linkable_type', 'linkable_id', 'collection_name'],
                    // saat konflik, cuma update kolom ini (id tidak tersentuh)
                    ['order_column', 'updated_at']
                );

                $attached = count(array_diff($desiredLibIds, $existingLibIds));
                $reordered = count($rows);
            }

            return compact('attached', 'detached', 'reordered');
        });
    }

    public function transform(Media $m): array
    {
        return (new MediaItemResource($m))->toArray(request());
    }

    public function transformCollection(Media $m): array
    {
        return MediaItemResource::collection($m)->resolve();
    }
}
