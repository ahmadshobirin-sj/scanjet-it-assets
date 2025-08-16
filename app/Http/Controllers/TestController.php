<?php

namespace App\Http\Controllers;

use App\Http\Tables\UserTable;
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

    public function dataTable()
    {
        $users_table = UserTable::make('users');

        // dd($users_table->export());
        return Inertia::render('test/data-table', [
            'users' => $users_table->toSchema(),
            'debug' => $users_table->debugQuery(),
        ]);
    }
}
