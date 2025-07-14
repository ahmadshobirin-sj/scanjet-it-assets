<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::middleware(['MsGraphAuthenticated'])->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
});

require __DIR__ . '/manufacture.php';
require __DIR__ . '/asset_category.php';
require __DIR__ . '/settings.php';
require __DIR__ . '/user.php';
require __DIR__ . '/role.php';
require __DIR__ . '/auth.php';
