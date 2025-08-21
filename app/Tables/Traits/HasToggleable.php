<?php

namespace App\Tables\Traits;

use App\Tables\Columns\Column;

/**
 * HasToggleable
 * -------------
 * Mengekspos daftar kolom yang dapat di-hide/show di FE.
 * Backend hanya mengembalikan nama kolom toggleable; logic UI di sisi FE.
 */
trait HasToggleable
{
    /**
     * Return array nama kolom toggleable.
     * Digunakan Table::toSchema()['meta']['toggleable_columns']
     */
    public function toggleableColumns(): array
    {
        return collect($this->columns())
            ->filter(fn (Column $col) => $col->isToggleable())
            ->map(fn (Column $col) => $col->getName())
            ->values()
            ->all();
    }
}
