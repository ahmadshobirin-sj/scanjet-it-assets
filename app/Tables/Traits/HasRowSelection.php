<?php

namespace App\Tables\Traits;

/**
 * HasRowSelection
 * ---------------
 * Menyediakan flag untuk mengaktifkan pemilihan baris di FE.
 * (Logic pemilihan dilakukan di FE; backend hanya expose boolean.)
 */
trait HasRowSelection
{
    protected bool $enableRowSelection = false;

    public function isRowSelectionEnabled(): bool
    {
        return $this->enableRowSelection;
    }
}
