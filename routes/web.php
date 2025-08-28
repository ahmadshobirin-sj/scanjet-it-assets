<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['MsGraphAuthenticated'])->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
});

Route::fallback(function () {
    return Inertia::render('error', [
        'status' => 404,
    ], 404);
});

require __DIR__.'/asset_assignment.php';
require __DIR__.'/asset.php';
require __DIR__.'/manufacture.php';
require __DIR__.'/asset_category.php';
require __DIR__.'/settings.php';
require __DIR__.'/user.php';
require __DIR__.'/role.php';
require __DIR__.'/auth.php';
require __DIR__.'/media-library.php';

require __DIR__.'/test.php';
