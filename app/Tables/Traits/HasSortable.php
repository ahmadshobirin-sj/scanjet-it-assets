<?php

namespace App\Tables\Traits;

use App\Tables\Columns\Column;

/**
 * HasSortable
 * -----------
 * Mengumpulkan konfigurasi sorting dari daftar Column:
 * - Only columns yang ditandai sortable() akan diikutkan.
 * - Count column disort via alias (sudah di-handle dalam Column::getAllowedSort()).
 */
trait HasSortable
{
    /**
     * Return array of AllowedSort instances untuk Spatie QueryBuilder.
     *
     * @return array<\Spatie\QueryBuilder\AllowedSort>
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
     * Diberikan untuk FE/meta: daftar nama kolom yang bisa disort.
     */
    public function getSortableColumnNames(): array
    {
        return collect($this->columns())
            ->filter(fn (Column $col) => $col->isSortable())
            ->map(fn (Column $col) => $col->getName())
            ->values()
            ->toArray();
    }

    /**
     * Default sort order (override di Table turunan bila perlu).
     * Format: ['name', '-created_at'] dst.
     */
    public function defaultSort(): array
    {
        return [];
    }
}
