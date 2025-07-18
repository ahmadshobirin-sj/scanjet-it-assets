<?php

namespace App\Tables\Traits;

use App\Tables\Columns\Column;

trait HasToggleable
{
    /**
     * Return array of toggleable column names.
     */
    public function toggleableColumns(): array
    {
        return collect($this->columns())
            ->filter(fn(Column $col) => $col->isToggleable())
            ->map(fn(Column $col) => $col->getName())
            ->values()
            ->all();
    }
}
