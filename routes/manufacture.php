<?php


use App\Http\Controllers\ManufactureController;
use Illuminate\Support\Facades\Route;

Route::middleware('MsGraphAuthenticated')->prefix('manufacture')->group(function () {
    Route::get('/', [ManufactureController::class, 'index'])
        ->name('manufacture.index');
    Route::get('/create', [ManufactureController::class, 'create'])
        ->name('manufacture.create');
    Route::post('/create', [ManufactureController::class, 'store'])
        ->name('manufacture.store');
    Route::get('/{manufacture}', [ManufactureController::class, 'show'])
        ->name('manufacture.show');
    Route::get('/{manufacture}/edit', [ManufactureController::class, 'edit'])
        ->name('manufacture.edit');
    Route::put('/{manufacture}/edit', [ManufactureController::class, 'update'])
        ->name('manufacture.update');
    Route::delete('/{manufacture}', [ManufactureController::class, 'destroy'])
        ->name('manufacture.destroy');
});
