<?php

namespace App\Tables;

use App\Http\Filters\NestedRelationSort;
use App\Tables\Columns\Column;

class AssetTable extends Table
{
    public function columns(): array
    {
        return [
            Column::make('name')
                ->sortable()
                ->filterable()
                ->globallySearchable()
                ->toggleable(),
            Column::make('category.name')
                ->sortable('custom', new NestedRelationSort)
                ->filterable()
                ->globallySearchable()
                ->toggleable(),
            Column::make('manufacture.name')
                ->sortable('custom', new NestedRelationSort)
                ->filterable()
                ->globallySearchable()
                ->toggleable(),
            Column::make('serial_number')
                ->sortable()
                ->filterable()
                ->globallySearchable()
                ->toggleable(),
            Column::make('location')
                ->sortable()
                ->filterable()
                ->globallySearchable()
                ->toggleable(),
            Column::make('warranty_expired')
                ->sortable()
                ->filterable()
                ->globallySearchable()
                ->toggleable(),
            Column::make('last_maintenance')
                ->sortable()
                ->filterable()
                ->globallySearchable()
                ->toggleable(),
            Column::make('created_at')
                ->sortable()
                ->filterable('exact')
                ->globallySearchable()
                ->toggleable(),
            Column::make('updated_at')
                ->sortable()
                ->filterable('exact')
                ->globallySearchable()
                ->toggleable(),
        ];
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
