<?php

namespace App\Tables;

use App\Tables\Columns\Column;

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
            Column::make('assigned_user.name')
                ->label('Assigned To')
                ->sortable()
                ->globallySearchable()
                ->toggleable(),
            Column::make('assigned_by.name')
                ->label('Assigned By')
                ->sortable()
                ->globallySearchable()
                ->toggleable(),
            Column::make('status')
                ->sortable()
                ->globallySearchable()
                ->toggleable(),
            Column::make('condition')
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
        return ['assignedUser', 'assignedBy'];
    }

    public function defaultSort(): array
    {
        return ['-assigned_at'];
    }
}
