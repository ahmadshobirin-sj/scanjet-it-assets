<?php

use App\Http\Controllers\AssetReturnController;
use Illuminate\Support\Facades\Route;

Route::middleware(['MsGraphAuthenticated'])->prefix('asset-return')->group(function () {
    Route::get('/export/pdf/{id}', [AssetReturnController::class, 'exportPdf'])->name('asset-return.exportPdf');
});
