<?php

namespace App\Tables\FilterColumns;

use App\Tables\Enums\AdvanceOperator;
use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\Filters\Filter;

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
        return new class($this->getName()) implements Filter
        {
            public function __construct(private string $property) {}

            public function __invoke(Builder $query, $value, string $property): Builder
            {
                if (! is_array($value) || ! isset($value['op'])) {
                    return $query;
                }

                $operator = $value['op'] ?? null;
                $filterValue = $value['value'] ?? null;

                if (! $operator || $filterValue === null) {
                    return $query;
                }

                try {
                    $operatorEnum = AdvanceOperator::from($operator);
                } catch (\ValueError $e) {
                    return $query;
                }

                // Handle nested properties
                if (str_contains($this->property, '.')) {
                    return $this->applyNestedFilter($query, $operatorEnum, $filterValue);
                }

                return $this->applyNumericOperator($query, $this->property, $operatorEnum, $filterValue);
            }

            private function applyNestedFilter(Builder $query, AdvanceOperator $operator, $value): Builder
            {
                $parts = explode('.', $this->property);
                $column = array_pop($parts);
                $relation = implode('.', $parts);

                return $query->whereHas($relation, function (Builder $q) use ($column, $operator, $value) {
                    $this->applyNumericOperator($q, $column, $operator, $value);
                });
            }

            private function applyNumericOperator(Builder $query, string $column, AdvanceOperator $operator, $value): Builder
            {
                // Handle array operators
                if ($operator->requiresArrayValue()) {
                    $values = is_array($value) ? $value : explode(',', $value);

                    return match ($operator) {
                        AdvanceOperator::BETWEEN => count($values) >= 2
                            ? $query->whereBetween($column, [(float) $values[0], (float) $values[1]])
                            : $query,
                        AdvanceOperator::NOT_BETWEEN => count($values) >= 2
                            ? $query->whereNotBetween($column, [(float) $values[0], (float) $values[1]])
                            : $query,
                        default => $query,
                    };
                }

                // Cast to numeric
                $numericValue = is_numeric($value) ? (float) $value : 0;

                return match ($operator) {
                    AdvanceOperator::EQUALS => $query->where($column, '=', $numericValue),
                    AdvanceOperator::NOT_EQUALS => $query->where($column, '!=', $numericValue),
                    AdvanceOperator::GREATER_THAN => $query->where($column, '>', $numericValue),
                    AdvanceOperator::GREATER_THAN_OR_EQUAL => $query->where($column, '>=', $numericValue),
                    AdvanceOperator::LESS_THAN => $query->where($column, '<', $numericValue),
                    AdvanceOperator::LESS_THAN_OR_EQUAL => $query->where($column, '<=', $numericValue),
                    default => $query,
                };
            }
        };
    }
}
