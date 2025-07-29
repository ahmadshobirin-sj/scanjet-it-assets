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
