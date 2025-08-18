<?php

namespace App\Http\Tables;

use App\Models\AssetAssignment;
use App\Tables\Columns\Column;
use App\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\QueryBuilder;

class AssetAssignmentTable extends Table
{
    public function resource(): Builder|string
    {
        return AssetAssignment::class;
    }

    public function columns(): array
    {
        return [
            Column::make('reference_code')
                ->label('Reference Code')
                ->sortable()
                ->globallySearchable()
                ->toggleable(),
            Column::make('assigned_user.email')
                ->label('Assigned To')
                ->globallySearchable()
                ->toggleable(),
            Column::make('assigned_by.email')
                ->label('Assigned By')
                ->globallySearchable()
                ->toggleable(),
            Column::make('assigned_at')
                ->sortable()
                ->globallySearchable()
                ->toggleable(),
            Column::make('confirmed_at')
                ->sortable()
                ->globallySearchable()
                ->toggleable(),
            Column::make('returned_at')
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
        return ['assignedUser:id,name,email', 'assignedBy:id,name,email'];
    }

    public function defaultSort(): array
    {
        return ['-assigned_at'];
    }

    public function customizeQuery(QueryBuilder $query): QueryBuilder
    {
        return $query;
    }
}
