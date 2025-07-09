<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('MsGraphAuthenticated')->prefix('user')->group(function () {
    Route::get('/', [UserController::class, 'index'])
        ->name('user.index');
    Route::post('/create', [UserController::class, 'store'])
        ->name('user.create');
    Route::put('/update/{user}', [UserController::class, 'update'])
        ->name('user.update');
    Route::delete('/update/{user}', [UserController::class, 'destroy'])
        ->name('user.destroy');
});
