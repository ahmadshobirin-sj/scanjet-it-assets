<?php

use App\Http\Controllers\AssetAssignmentController;
use Illuminate\Support\Facades\Route;

Route::middleware('MsGraphAuthenticated')->prefix('asset-assignment')->group(function () {
    Route::get('/', [AssetAssignmentController::class, 'index'])
        ->name('asset-assignment.index');
    Route::get('/create', [AssetAssignmentController::class, 'create'])
        ->name('asset-assignment.create');
    Route::post('/create', [AssetAssignmentController::class, 'assign'])
        ->name('asset-assignment.assign');
});

Route::middleware('signed')->prefix('asset-assignment')->group(function () {
    Route::get('/confirmation/{reference_code}', [AssetAssignmentController::class, 'confirmation'])->name('asset-assignment.confirmation');
});
