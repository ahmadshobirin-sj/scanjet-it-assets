<?php

namespace App\Http\Tables;

use App\Tables\Columns\Column;
use App\Tables\Table;
use Spatie\QueryBuilder\QueryBuilder;

class AssetAssignmentTable extends Table
{
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
                ->sortable()
                ->globallySearchable()
                ->toggleable(),
            Column::make('assigned_by.email')
                ->label('Assigned By')
                ->sortable()
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
