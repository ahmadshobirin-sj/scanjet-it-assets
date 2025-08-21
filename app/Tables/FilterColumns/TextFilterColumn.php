<?php

namespace App\Tables\FilterColumns;

use App\Tables\Enums\AdvanceOperator;

class TextFilterColumn extends FilterColumn
{
    protected bool $caseSensitive = false;

    protected function setDefaultClauses(): void
    {
        $operators = AdvanceOperator::textOperators();

        $this->clauses = array_map(
            fn (AdvanceOperator $op) => [
                'label' => $op->label(),
                'value' => $op->value,
            ],
            $operators
        );

        $this->defaultClause = AdvanceOperator::CONTAINS->value;
    }

    public function caseSensitive(bool $sensitive = true): static
    {
        $this->caseSensitive = $sensitive;

        return $this;
    }

    public function getType(): string
    {
        return 'text';
    }
}
