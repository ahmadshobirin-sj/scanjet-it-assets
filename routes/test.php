<?php

use App\Http\Controllers\TestController;
use Illuminate\Support\Facades\Route;

// Test routes
Route::get('/test/data-grid', [TestController::class, 'dataGrid'])->name('test.data-grid');
Route::get('/test/simple-data-grid', function () {
    return inertia('simple-data-grid-test');
})->name('test.simple-data-grid');
Route::get('/test/multiple-selector', [TestController::class, 'multipleSelector'])->name('test.multiple-selector');
Route::get('/test/data-table', [TestController::class, 'dataTable'])->name('test.data-table');
