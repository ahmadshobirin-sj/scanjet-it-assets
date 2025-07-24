<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class TestController extends Controller
{
    public function dataGrid()
    {
        return Inertia::render('test-data-grid');
    }

    public function multipleSelector()
    {
        return Inertia::render('test/multiple-selector');
    }
}
