<?php

namespace App\Tables\Traits;

trait HasRowSelection
{
    protected bool $enableRowSelection = false;

    public function isRowSelectionEnabled(): bool
    {
        return $this->enableRowSelection;
    }
}
