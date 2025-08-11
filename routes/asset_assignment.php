<?php

use App\Http\Controllers\AssetAssignmentController;
use App\Http\Controllers\AssetReturnController;
use Illuminate\Support\Facades\Route;

Route::middleware('MsGraphAuthenticated')->prefix('asset-assignment')->group(function () {
    Route::get('/', [AssetAssignmentController::class, 'index'])
        ->name('asset-assignment.index');
    Route::get('/assign', [AssetAssignmentController::class, 'create'])
        ->name('asset-assignment.assign');
    Route::post('/assign', [AssetAssignmentController::class, 'assign'])
        ->name('asset-assignment.storeAssign');
    Route::get('/return/{reference_code}', [AssetReturnController::class, 'create'])
        ->name('asset-assignment.return');
    Route::put('/return/{reference_code}/test', [AssetReturnController::class, 'store'])
        ->name('asset-assignment.storeReturn');
});

Route::middleware('signed')->prefix('asset-assignment')->group(function () {
    Route::get('/confirmation/{reference_code}', [AssetAssignmentController::class, 'confirmation'])->name('asset-assignment.confirmation');
});
