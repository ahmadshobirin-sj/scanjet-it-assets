<?php

namespace App\Http\Tables;

use App\Models\Manufacture;
use App\Tables\Columns\Column;
use App\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ManufactureTable extends Table
{
    public function resource(): Builder|string
    {
        return Manufacture::class;
    }

    public function columns(): array
    {
        return [
            Column::make('name')
                ->label('Name')
                ->sortable()
                ->globallySearchable()
                ->toggleable(),
            Column::make('created_at')
                ->label('Created At')
                ->sortable()
                ->globallySearchable()
                ->toggleable(),
        ];
    }

    public function filters(): array
    {
        return [];
    }

    public function defaultSort(): array
    {
        return ['-created_at'];
    }
}
