<?php

namespace App\Tables\Traits;

use App\Tables\FilterColumns\FilterColumn;

trait HasFilter
{
    /**
     * Return filters and search filters for QueryBuilder.
     */
    public function filterResolver(): array
    {
        $filters = collect($this->filters());
        $columnFilters = $filters
            ->filter(fn (FilterColumn $col) => $col->getFilterType() !== null)
            ->map(fn (FilterColumn $col) => $col->getAllowedFilter())
            ->values();

        return collect($columnFilters)
            ->toArray();
    }

    public function defaultFilters(): array
    {
        return [];
    }
}
