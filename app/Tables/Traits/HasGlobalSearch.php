<?php

namespace App\Tables\Traits;

use App\Http\Filters\GlobalSearchNew;
use App\Tables\Columns\Column;
use Spatie\QueryBuilder\AllowedFilter;

trait HasGlobalSearch
{
    public function globalSearchResolver(): array
    {
        $searchableColumns = $this->getGlobalSearchableColumns();

        if (empty($searchableColumns)) {
            return [];
        }
        // Extract column names (exclude count columns)
        $columnNames = array_map(function ($col) {
            return $col instanceof Column ? $col->getName() : $col;
        }, $searchableColumns);

        // Use GlobalSearchNew filter for regular columns only
        return [
            AllowedFilter::custom(
                'search',
                new GlobalSearchNew($columnNames)
            ),
        ];
    }

    protected function getGlobalSearchableColumns(): array
    {
        return collect($this->columns())
            ->filter(fn (Column $col) => $col->isGlobalSearchable() && ! $col->isCountColumn())
            ->all();
    }
}
