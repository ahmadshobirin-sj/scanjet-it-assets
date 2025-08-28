<?php

namespace App\Models\Concerns;

use App\Models\MediaLibrary;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

trait HasMediaLibrary
{
    /**
     * Relasi ke MediaLibrary via pivot media_links.
     * Pivot menyimpan role per target di `collection_name` + urutan di `order_column`.
     */
    public function mediaLibraries(): MorphToMany
    {
        return $this->morphToMany(
            MediaLibrary::class,
            'linkable',            // -> linkable_type, linkable_id
            'media_links',         // pivot table
            'linkable_id',         // FK ke model ini
            'media_library_id'     // FK ke library
        )->withPivot(['collection_name', 'order_column'])
            ->withTimestamps();
    }

    /** Dapatkan key type yg disimpan di linkable_type (morph key jika ada, FQCN jika tidak). */
    protected function mediaLinkableType(): string
    {
        $map = Relation::morphMap() ?: [];
        $class = static::class;
        $key = array_search($class, $map, true);

        return $key ?: $class;
    }

    /**
     * Ambil semua Spatie Media yang tertaut (flatten dari mediaLibraries->media).
     * Bisa filter:
     * - $pivotCollection   : role di pivot (media_links.collection_name), mis. 'po_attachment'
     * - $mediaCollection   : koleksi Spatie di tabel media (media.collection_name), mis. 'attachments'
     */
    public function mediaLibrariesMedia(?string $pivotCollection = null, ?string $mediaCollection = null): Collection
    {
        $this->loadMissing([
            'mediaLibraries' => fn ($q) => $pivotCollection ? $q->wherePivot('collection_name', $pivotCollection) : $q,
            'mediaLibraries.media' => fn ($q) => $mediaCollection ? $q->where('collection_name', $mediaCollection) : $q,
        ]);

        return $this->mediaLibraries
            ->flatMap(function ($ml) use ($mediaCollection) {
                $med = $ml->media;

                return $mediaCollection ? $med->where('collection_name', $mediaCollection) : $med;
            })
            ->values();
    }

    /**
     * Query builder langsung ke tabel media (JOIN pivot).
     * Gunakan untuk paginate/sort berat di controller.
     */
    public function mediaLibrariesMediaQuery(?string $pivotCollection = null, ?string $mediaCollection = null)
    {
        $type = $this->mediaLinkableType();

        $q = Media::query()
            ->select('media.*', 'ml.order_column', 'ml.collection_name as pivot_collection_name')
            ->from('media')
            ->join('media_links as ml', 'ml.media_library_id', '=', 'media.model_id')
            ->where('media.model_type', MediaLibrary::class)
            ->where('ml.linkable_type', $type)
            ->where('ml.linkable_id', (string) $this->getKey());

        if ($pivotCollection) {
            $q->where('ml.collection_name', $pivotCollection);
        }
        if ($mediaCollection) {
            $q->where('media.collection_name', $mediaCollection);
        }

        return $q;
    }

    /**
     * Link (attach) daftar Spatie media.id ke model ini pada pivot collection tertentu.
     * Mengisi order_column secara incremental (max+1).
     *
     * @return int jumlah baris di-insert/update
     */
    public function attachMediaByIds(array $mediaIds, string $pivotCollection = 'default'): int
    {
        $mediaIds = array_values(array_filter($mediaIds, fn ($v) => is_numeric($v)));
        if (! $mediaIds) {
            return 0;
        }

        $type = $this->mediaLinkableType();

        return DB::transaction(function () use ($mediaIds, $pivotCollection, $type) {
            // map media.id -> media_library_id (UUID)
            $map = Media::query()
                ->whereIn('id', $mediaIds)
                ->where('model_type', MediaLibrary::class)
                ->pluck('model_id', 'id');

            $now = now();
            $rows = 0;

            // next order per group
            $max = DB::table('media_links')
                ->where('linkable_type', $type)
                ->where('linkable_id', (string) $this->getKey())
                ->where('collection_name', $pivotCollection)
                ->max('order_column');
            $next = is_null($max) ? 1 : (int) $max + 1;

            foreach ($mediaIds as $mid) {
                $libId = $map[$mid] ?? null;
                if (! $libId) {
                    continue;
                }

                DB::table('media_links')->updateOrInsert(
                    [
                        'media_library_id' => (string) $libId,
                        'linkable_type' => $type,
                        'linkable_id' => (string) $this->getKey(),
                        'collection_name' => $pivotCollection,
                    ],
                    [
                        'order_column' => $next++,
                        'updated_at' => $now,
                        'created_at' => $now,
                    ]
                );
                $rows++;
            }

            return $rows;
        });
    }

    /**
     * Unlink (detach) daftar Spatie media.id dari model ini.
     * Jika $pivotCollection diisi, hanya hapus untuk role tersebut.
     *
     * @return int jumlah baris dihapus
     */
    public function detachMediaByIds(array $mediaIds, ?string $pivotCollection = null): int
    {
        $mediaIds = array_values(array_filter($mediaIds, fn ($v) => is_numeric($v)));
        if (! $mediaIds) {
            return 0;
        }

        $type = $this->mediaLinkableType();

        return DB::transaction(function () use ($mediaIds, $pivotCollection, $type) {
            $libIds = Media::query()
                ->whereIn('id', $mediaIds)
                ->where('model_type', MediaLibrary::class)
                ->pluck('model_id'); // UUID list

            $q = DB::table('media_links')
                ->whereIn('media_library_id', $libIds)
                ->where('linkable_type', $type)
                ->where('linkable_id', (string) $this->getKey());

            if ($pivotCollection !== null) {
                $q->where('collection_name', $pivotCollection);
            }

            return $q->delete();
        });
    }

    /**
     * Reorder urutan berdasarkan urutan array mediaIds (1..n) untuk collection tertentu.
     */
    public function reorderMediaByIds(array $orderedMediaIds, string $pivotCollection = 'default'): void
    {
        $type = $this->mediaLinkableType();

        DB::transaction(function () use ($orderedMediaIds, $pivotCollection, $type) {
            $ordered = array_values(array_filter($orderedMediaIds, fn ($v) => is_numeric($v)));
            if (! $ordered) {
                return;
            }

            $libMap = Media::query()
                ->whereIn('id', $ordered)
                ->where('model_type', MediaLibrary::class)
                ->pluck('model_id', 'id'); // [media_id => library_uuid]

            foreach ($ordered as $idx => $mid) {
                $libId = $libMap[$mid] ?? null;
                if (! $libId) {
                    continue;
                }

                DB::table('media_links')
                    ->where('media_library_id', (string) $libId)
                    ->where('linkable_type', $type)
                    ->where('linkable_id', (string) $this->getKey())
                    ->where('collection_name', $pivotCollection)
                    ->update([
                        'order_column' => $idx + 1,
                        'updated_at' => now(),
                    ]);
            }
        });
    }
}
