<?php

namespace App\Http\Tables;

use App\Models\Role;
use App\Tables\Columns\Column;
use App\Tables\FilterColumns\DateFilterColumn;
use App\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class RoleTable extends Table
{
    protected string $name = 'roles';

    protected string $rowId = 'id';

    public function resource(): Builder|string
    {
        return Role::class;
    }

    public function columns(): array
    {
        return [
            Column::make('name')
                ->label('Name')
                ->globallySearchable()
                ->sortable()
                ->toggleable(),
            Column::count('permissions', 'id')
                ->label('Permissions')
                ->searchableCount()
                ->sortableCount()
                ->toggleable(),
            Column::make('created_at')
                ->label('Created At')
                ->globallySearchable()
                ->sortable()
                ->toggleable(),
        ];
    }

    public function filters(): array
    {
        return [
            DateFilterColumn::make('created_at')
                ->label('Created At'),
        ];
    }

    public function defaultSort(): array
    {
        return ['-created_at'];
    }
}
