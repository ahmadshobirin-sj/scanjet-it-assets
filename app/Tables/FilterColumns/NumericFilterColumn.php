<?php

namespace App\Tables\FilterColumns;

use App\Tables\Enums\AdvanceOperator;
use App\Tables\Supports\AdvancedFilter;
use Spatie\QueryBuilder\Filters\Filter;

/**
 * NumericFilterColumn
 * -------------------
 * - Operator numeric penuh (>, >=, <, <=, =, !=, BETWEEN/NOT_BETWEEN).
 * - Delegasi ke AdvancedFilter agar dapat nested & pivot.
 * - Meta min/max/precision untuk FE (tidak mempengaruhi query).
 */
class NumericFilterColumn extends FilterColumn
{
    protected ?float $min = null;

    protected ?float $max = null;

    protected int $precision = 2;

    protected function setDefaultClauses(): void
    {
        $operators = AdvanceOperator::numericOperators();

        $this->clauses = array_map(
            fn (AdvanceOperator $op) => [
                'label' => $op->label(),
                'value' => $op->value,
            ],
            $operators
        );

        $this->defaultClause = AdvanceOperator::EQUALS->value;
    }

    public function min(float $min): static
    {
        $this->min = $min;

        return $this;
    }

    public function max(float $max): static
    {
        $this->max = $max;

        return $this;
    }

    public function precision(int $precision): static
    {
        $this->precision = $precision;

        return $this;
    }

    public function getType(): string
    {
        return 'numeric';
    }

    protected function getMeta(): ?array
    {
        return [
            'min' => $this->min,
            'max' => $this->max,
            'precision' => $this->precision,
        ];
    }

    protected function createFilter(): Filter
    {
        // AdvancedFilter sudah handle nested/pivot/array valued ops
        return new AdvancedFilter($this->getName());
    }
}
