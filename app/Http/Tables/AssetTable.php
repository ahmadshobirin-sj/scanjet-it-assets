<?php

namespace App\Http\Tables;

use App\Models\Asset;
use App\Tables\Columns\Column;
use App\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class AssetTable extends Table
{
    public function resource(): Builder|string
    {
        return Asset::class;
    }

    public function columns(): array
    {
        return [
            Column::make('name')
                ->sortable()
                ->globallySearchable()
                ->toggleable(),
            Column::make('category.name')
                ->globallySearchable()
                ->toggleable(),
            Column::make('manufacture.name')
                ->globallySearchable()
                ->toggleable(),
            Column::make('serial_number')
                ->sortable()
                ->globallySearchable()
                ->toggleable(),
            Column::make('location')
                ->sortable()
                ->globallySearchable()
                ->toggleable(),
            Column::make('warranty_expired')
                ->sortable()
                ->globallySearchable()
                ->toggleable(),
            Column::make('last_maintenance')
                ->sortable()
                ->globallySearchable()
                ->toggleable(),
            Column::make('created_at')
                ->sortable()
                ->globallySearchable()
                ->toggleable(),
            Column::make('status')
                ->sortable()
                ->globallySearchable()
                ->toggleable(),
        ];
    }

    public function filters(): array
    {
        return [];
    }

    public function with(): array
    {
        return ['category', 'manufacture'];
    }

    public function defaultSort(): array
    {
        return ['-created_at'];
    }
}
