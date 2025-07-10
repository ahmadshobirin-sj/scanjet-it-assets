<?php

use App\Http\Controllers\RoleController;
use Illuminate\Support\Facades\Route;

Route::middleware('MsGraphAuthenticated')->prefix('role')->group(function () {
    Route::get('/', [RoleController::class, 'index'])
        ->name('role.index');
    Route::get('/create', [RoleController::class, 'create'])
        ->name('role.create');
    Route::post('/create', [RoleController::class, 'store'])
        ->name('role.store');
    Route::get('/{role}', [RoleController::class, 'show'])
        ->name('role.show');
    Route::get('/{role}/edit', [RoleController::class, 'edit'])
        ->name('role.edit');
    Route::put('/{role}/edit', [RoleController::class, 'update'])
        ->name('role.update');
    Route::delete('/{role}', [RoleController::class, 'destroy'])
        ->name('role.destroy');
});
