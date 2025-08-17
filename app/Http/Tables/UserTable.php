<?php

namespace App\Http\Tables;

use App\Models\Role;
use App\Models\User;
use App\Tables\Columns\Column;
use App\Tables\Enums\AdvanceOperator;
use App\Tables\FilterColumns\DateFilterColumn;
use App\Tables\FilterColumns\SelectFilterColumn;
use App\Tables\FilterColumns\TextFilterColumn;
use App\Tables\NewTable;
use Illuminate\Database\Eloquent\Builder;

class UserTable extends NewTable
{
    protected bool $enableRowSelection = true;

    public function resource(): Builder|string
    {
        return User::class;
    }

    public function columns(): array
    {
        return [
            Column::make('name')
                ->label('Full Name')
                ->sortable()
                ->globallySearchable()
                ->toggleable(),

            Column::make('email')
                ->label('Email Address')
                ->sortable()
                ->globallySearchable()
                ->toggleable(),

            Column::make('roles.name')
                ->label('Roles')
                ->globallySearchable()
                ->toggleable(),

            Column::make('created_at')
                ->label('Created Date')
                ->sortable()
                ->toggleable(),

            Column::make('updated_at')
                ->label('Last Updated')
                ->sortable()
                ->toggleable(),
        ];
    }

    public function filters(): array
    {
        return [
            // Text filter for name with custom operators
            TextFilterColumn::make('name')
                ->label('Full Name'),

            // Text filter for email
            TextFilterColumn::make('email')
                ->label('Email Address'),

            // Select filter for roles (multiple selection)
            SelectFilterColumn::make('roles.id')
                ->label('Roles')
                ->multiple()
                ->nested()
                ->remoteUrl(route('role.index'))
                ->options(function () {
                    return Role::query()
                        ->select(['id as value', 'name as label'])
                        ->orderBy('name')
                        ->get()
                        ->toArray();
                }),

            // Date filter for created date with default value
            DateFilterColumn::make('created_at')
                ->label('Registration Date')
                ->defaultClause(AdvanceOperator::BETWEEN->value)
                ->default([
                    now()->subMonth(),
                    now(),
                ]),
        ];
    }

    public function defaultSort(): array
    {
        return ['-created_at'];
    }

    public function with(): array
    {
        return ['roles:id,name'];
    }
}
