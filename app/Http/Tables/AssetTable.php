<?php

namespace App\Http\Tables;

use App\Models\Asset;
use App\Tables\Columns\Column;
use App\Tables\FilterColumns\TextFilterColumn;
use App\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\QueryBuilder;

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
            Column::make('current_assignment.assigned_user.name')
                ->label('Assigned To')
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
        return [
            TextFilterColumn::make('current_assignment.assigned_user.email')
                ->label('Assigned To'),
        ];
    }

    public function with(): array
    {
        return [
            'category',
            'manufacture',
            'current_assignment:id,assigned_user_id',
            'current_assignment.assigned_user:id,name,email,job_title,office_location',
        ];
    }

    public function defaultSort(): array
    {
        return ['-created_at'];
    }

    protected function customizeQuery(QueryBuilder $query): QueryBuilder
    {
        return $query;
    }
}
