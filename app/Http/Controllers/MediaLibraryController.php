<?php

namespace App\Http\Controllers;

use App\Http\Services\MediaLibraryService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MediaLibraryController
{
    use AuthorizesRequests;

    public function __construct(protected MediaLibraryService $mediaLibraryService) {}

    public function index()
    {
        if (! (
            $this->authorize('media_library.viewAny', Media::class) ||
            $this->authorize('media_library.create', Media::class)
        )) {
            abort(403);
        }

        return Inertia::render('media-library/list');
    }
}
