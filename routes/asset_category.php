<?php

use App\Http\Controllers\AssetCategoryController;
use Illuminate\Support\Facades\Route;

Route::middleware('MsGraphAuthenticated')->prefix('asset-category')->group(function () {
    Route::get('/', [AssetCategoryController::class, 'index'])
        ->name('asset_category.index');
    Route::post('/create', [AssetCategoryController::class, 'store'])
        ->name('asset_category.store');
    Route::get('/{asset_category}', [AssetCategoryController::class, 'show'])
        ->name('asset_category.show');
    Route::get('/{asset_category}/edit', [AssetCategoryController::class, 'edit'])
        ->name('asset_category.edit');
    Route::put('/{asset_category}/edit', [AssetCategoryController::class, 'update'])
        ->name('asset_category.update');
    Route::delete('/{asset_category}', [AssetCategoryController::class, 'destroy'])
        ->name('asset_category.destroy');
});
