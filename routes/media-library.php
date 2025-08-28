<?php

use App\Http\Controllers\MediaLibraryController;
use Illuminate\Support\Facades\Route;

Route::middleware(['MsGraphAuthenticated'])->prefix('media-library')->group(function () {
    Route::get('/', [MediaLibraryController::class, 'index'])->name('media-library.index');
});
