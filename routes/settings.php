<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('MsGraphAuthenticated')->group(function () {
    Route::get('settings', function () {
        return redirect()->route('appearance');
    })->name('settings');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');
});
