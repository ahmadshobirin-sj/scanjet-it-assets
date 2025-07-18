<?php


use App\Http\Controllers\AssetController;
use Illuminate\Support\Facades\Route;

Route::middleware('MsGraphAuthenticated')->prefix('asset')->group(function () {
    Route::get('/', [AssetController::class, 'index'])
        ->name('asset.index');
    Route::get('/create', [AssetController::class, 'create'])
        ->name('asset.create');
    Route::post('/create', [AssetController::class, 'store'])
        ->name('asset.store');
    Route::get('/{asset}', [AssetController::class, 'show'])
        ->name('asset.show');
    Route::get('/{asset}/edit', [AssetController::class, 'edit'])
        ->name('asset.edit');
    Route::put('/{asset}/edit', [AssetController::class, 'update'])
        ->name('asset.update');
    Route::delete('/{asset}', [AssetController::class, 'destroy'])
        ->name('asset.destroy');
});
