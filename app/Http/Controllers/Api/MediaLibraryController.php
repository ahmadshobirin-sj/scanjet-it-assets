<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Services\MediaLibraryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MediaLibraryController extends Controller
{
    public function __construct(private MediaLibraryService $service) {}

    /** GET /media-library → list global */
    public function index(Request $request): JsonResponse
    {
        $page = (int) $request->query('page', 1);
        $per = (int) $request->query('per_page', 24);

        /** @var \Illuminate\Pagination\LengthAwarePaginator $paginator */
        $paginator = $this->service->libraryQB($page, $per);

        // versi yang aman untuk Intelephense:
        $data = $paginator->getCollection()
            ->map(fn ($m) => $this->service->transform($m))
            ->values();

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }

    /** POST /media-library/upload → single: file | multiple: files[] */
    public function upload(Request $request): JsonResponse
    {
        $scanEnabled = (bool) config('media-library.enable_file_scan', false);
        $collection = $request->input('collection');

        // multiple
        if ($request->hasFile('files')) {
            $validated = $request->validate([
                'files' => ['required', 'array', 'min:1'],
                'files.*' => ['required', 'file', 'max:10240'],
            ]);

            $res = $this->service->uploadManyToLibrary(
                $validated['files'],
                $collection,
                $scanEnabled
            );

            return response()->json($res, 201);
        }

        // single
        $rules = ['file' => ['required', 'file', 'max:10240']];
        if ($scanEnabled) {
            $rules['file'][] = 'clamav';
        }
        $validated = $request->validate($rules);

        $item = $this->service->uploadToLibrary(
            $validated['file'],
            $collection
        );

        return response()->json($item, 201);
    }

    /** POST /media-library/links { target_type, target_id, media_ids[] } */
    public function link(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'target_type' => ['required', 'string'],        // morph key (disarankan) atau FQCN
            'target_id' => ['required', 'string'],        // UUID string
            'media_ids' => ['required', 'array', 'min:1'],
            'media_ids.*' => ['numeric'],
        ]);

        $count = $this->service->linkByMediaIds(
            $validated['target_type'],
            $validated['target_id'],
            $validated['media_ids'],
        );

        return response()->json(['linked' => $count]);
    }

    /** DELETE /media-library/links { target_type, target_id, media_ids[] } */
    public function unlink(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'target_type' => ['required', 'string'],
            'target_id' => ['required', 'string'],
            'media_ids' => ['required', 'array', 'min:1'],
            'media_ids.*' => ['numeric'],
        ]);

        $count = $this->service->unlinkByMediaIds(
            $validated['target_type'],
            $validated['target_id'],
            $validated['media_ids'],
        );

        return response()->json(['unlinked' => $count]);
    }

    /** GET /media-library/links/{type}/{id}?collection=images */
    public function listLinked(Request $request, string $type, string $id): JsonResponse
    {
        $items = $this->service->listLinked($type, $id, $request->query('collection'));

        return response()->json(['data' => $items]);
    }

    /** DELETE /media-library/{mediaId} */
    public function destroy(int $mediaId): JsonResponse
    {
        $this->service->deleteMediaByMediaId($mediaId);

        return response()->json(['deleted' => true]);
    }

    /** POST /media-library/bulk-delete { ids: [..] } */
    public function bulkDelete(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['numeric'],
        ]);
        $count = $this->service->deleteManyByMediaIds($validated['ids']);

        return response()->json(['deleted' => $count]);
    }
}
