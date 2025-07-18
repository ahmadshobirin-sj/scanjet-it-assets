<?php

namespace App\Tables\Traits;

use App\Tables\Columns\Column;

trait HasSortable
{
    /**
     * Return array of sortable column names.
     */
    public function sorts(): array
    {
        $columns = collect($this->columns())
            ->filter(fn(Column $col) => $col->isSortable())
            ->map(fn(Column $col) => $col->getAllowedSort())
            ->values()
            ->toArray();

        return $columns;
    }

    public function defaultSort(): array
    {
        return [];
    }
}
