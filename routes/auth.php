<?php

use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

Route::middleware(['guest'])->group(function () {
    Route::get('login', [AuthController::class, 'login'])
        ->name('login');
    Route::get('auth/callback', [AuthController::class, 'connect'])->name('connect');
});

Route::middleware(['MsGraphAuthenticated'])->group(function () {
    Route::post('logout', [AuthController::class, 'logout'])
        ->name('logout');
});
