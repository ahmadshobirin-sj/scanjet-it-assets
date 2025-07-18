<?php

namespace App\Tables\Sorts;

use Spatie\QueryBuilder\AllowedSort as QueryBuilderAllowedSort;
use Spatie\QueryBuilder\Enums\SortDirection;
use Spatie\QueryBuilder\QueryBuilder;

class AllowedSort extends QueryBuilderAllowedSort
{
    public function sort(QueryBuilder $query, ?bool $descending = null): void
    {
        $descending = $descending ?? ($this->defaultDirection === SortDirection::DESCENDING);
        $column = $this->qualifyColumn($this->internalName, $query);

        // Panggil sortClass dengan kolom yang sudah diberi prefix jika perlu
        ($this->sortClass)($query->getEloquentBuilder(), $descending, $column);
    }

    /**
     * Tambahkan prefix nama table jika bukan nested property.
     */
    protected function qualifyColumn(string $name, QueryBuilder $query): string
    {
        return $this->isNestedProperty($name)
            ? $name
            : $query->getModel()->getTable() . '.' . $name;
    }

    /**
     * Cek apakah nama kolom adalah relasi (mengandung titik).
     */
    protected function isNestedProperty(string $name): bool
    {
        return str_contains($name, '.');
    }
}
