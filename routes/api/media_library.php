<?php

use App\Http\Controllers\Api\MediaLibraryController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'api'])->prefix('media-library')->group(function () {
    Route::get('/', [MediaLibraryController::class, 'index']);
    Route::post('/upload', [MediaLibraryController::class, 'upload']);

    Route::post('/links', [MediaLibraryController::class, 'link']);
    Route::delete('/links', [MediaLibraryController::class, 'unlink']);
    Route::get('/links/{type}/{id}', [MediaLibraryController::class, 'listLinked']);

    Route::delete('/{mediaId}', [MediaLibraryController::class, 'destroy']);
    Route::post('/bulk-delete', [MediaLibraryController::class, 'bulkDelete']);
});
