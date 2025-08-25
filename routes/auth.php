<?php

use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

Route::middleware(['guest'])->group(function () {
    Route::get('login', [AuthController::class, 'login'])
        ->name('login');
    Route::prefix('auth')->group(function () {
        Route::get('/authorize', [AuthController::class, 'authorize'])->name('authorize');
        Route::group(['EnsureHasAuthorizationCode'], function () {
            Route::get('/callback', [AuthController::class, 'redirectUri']);
        });
    });
});

Route::middleware(['MsGraphAuthenticated'])->group(function () {
    Route::post('logout', [AuthController::class, 'logout'])
        ->name('logout');
});
