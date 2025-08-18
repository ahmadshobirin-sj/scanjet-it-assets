<?php

namespace App\Http\Tables;

use App\Models\AssetCategory;
use App\Tables\Columns\Column;
use App\Tables\NewTable;
use Illuminate\Database\Eloquent\Builder;

class AssetCategoryTable extends NewTable
{
    public function resource(): Builder|string
    {
        return AssetCategory::class;
    }

    public function columns(): array
    {
        return [
            Column::make('name')
                ->label('Name')
                ->toggleable()
                ->sortable()
                ->globallySearchable(),
            Column::make('created_at')
                ->label('Created At')
                ->toggleable()
                ->sortable()
                ->globallySearchable(),
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
