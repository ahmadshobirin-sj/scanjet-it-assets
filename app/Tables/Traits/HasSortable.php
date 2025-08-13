<?php

namespace App\Tables\Traits;

use App\Tables\Columns\Column;

trait HasSortable
{
    /**
     * Return array of AllowedSort instances for QueryBuilder.
     */
    public function sorts(): array
    {
        return collect($this->columns())
            ->filter(fn (Column $col) => $col->isSortable())
            ->map(fn (Column $col) => $col->getAllowedSort())
            ->values()
            ->toArray();
    }

    /**
     * Get sortable column names as strings for frontend/meta
     */
    public function getSortableColumnNames(): array
    {
        return collect($this->columns())
            ->filter(fn (Column $col) => $col->isSortable())
            ->map(fn (Column $col) => $col->getName())
            ->values()
            ->toArray();
    }

    public function defaultSort(): array
    {
        return [];
    }
}
