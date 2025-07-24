<?php

namespace App\Tables\Traits;

use App\Http\Filters\GlobalSearchNew;
use App\Tables\Columns\Column;
use Spatie\QueryBuilder\AllowedFilter;

trait HasGlobalSearch
{
    /**
     * Return filters and search filters for QueryBuilder.
     */
    public function globalSearchResolver(): array
    {
        $columns = collect($this->columns());

        $globalSearchableColumns = $columns
            ->filter(fn (Column $col) => $col->isGlobalSearchable())
            ->map(fn (Column $col) => $col->getName())
            ->values()
            ->all();

        $globalSearch = AllowedFilter::custom('search', new GlobalSearchNew($globalSearchableColumns));

        return collect([$globalSearch])
            ->toArray();
    }
}
