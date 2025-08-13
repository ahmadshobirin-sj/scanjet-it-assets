<?php

namespace App\Tables\FilterColumns;

use App\Tables\Enums\AdvanceOperator;
use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\Filters\Filter;

class DateFilterColumn extends FilterColumn
{
    protected string $format = 'Y-m-d';

    protected function setDefaultClauses(): void
    {
        // Date-specific operators

        $operators = AdvanceOperator::dateOperators();

        $this->clauses = array_map(
            fn (AdvanceOperator $op) => [
                'label' => $op->label(),
                'value' => $op->value,
            ],
            $operators
        );

        $this->defaultClause = AdvanceOperator::EQUALS->value;
    }

    public function format(string $format): static
    {
        $this->format = $format;

        return $this;
    }

    public function getType(): string
    {
        return 'date';
    }

    protected function getMeta(): ?array
    {
        return [
            'format' => $this->format,
            'picker' => 'date', // Tell frontend to use date picker
        ];
    }

    protected function createFilter(): Filter
    {
        return new class($this->getName(), $this->format) implements Filter
        {
            public function __construct(
                private string $property,
                private string $format
            ) {}

            public function __invoke(Builder $query, $value, string $property): Builder
            {
                if (! is_array($value) || ! isset($value['op'])) {
                    return $query;
                }

                $operator = $value['op'] ?? null;
                // dd($operator, $value);
                if (! $operator) {
                    return $query;
                }

                try {
                    $operatorEnum = AdvanceOperator::from($operator);
                } catch (\ValueError $e) {
                    return $query;
                }

                // ⚠️ FIX: Check if operator requires value BEFORE accessing $value['value']
                if (! $operatorEnum->requiresValue()) {
                    // Handle operators that don't need a value (IS_SET, IS_NOT_SET)
                    if (str_contains($this->property, '.')) {
                        return $this->applyNestedNullCheck($query, $operatorEnum);
                    }

                    return match ($operatorEnum) {
                        AdvanceOperator::IS_SET, AdvanceOperator::IS_NOT_NULL => $query->whereNotNull($this->property),
                        AdvanceOperator::IS_NOT_SET, AdvanceOperator::IS_NULL => $query->whereNull($this->property),
                        default => $query,
                    };
                }

                // Now we can safely access $value['value'] for operators that require it
                $filterValue = $value['value'] ?? null;

                // Check if value is provided for operators that require it
                if ($operatorEnum->requiresValue() && $filterValue === null) {
                    // Skip filter if value is required but not provided
                    return $query;
                }

                // Handle nested properties
                if (str_contains($this->property, '.')) {
                    return $this->applyNestedFilter($query, $operatorEnum, $filterValue);
                }

                // Handle BETWEEN
                if ($operatorEnum->requiresArrayValue()) {
                    $values = is_array($filterValue) ? $filterValue : explode(',', $filterValue);

                    if (count($values) < 2) {
                        return $query;
                    }

                    // Add time boundaries for date comparison
                    $startDate = $values[0].' 00:00:00';
                    $endDate = $values[1].' 23:59:59';

                    if ($operatorEnum === AdvanceOperator::BETWEEN) {
                        return $query->whereBetween($this->property, [$startDate, $endDate]);
                    } else { // NOT_BETWEEN
                        return $query->whereNotBetween($this->property, [$startDate, $endDate]);
                    }
                }

                // Handle single value date comparisons
                return match ($operatorEnum) {
                    AdvanceOperator::EQUALS => $query->whereDate($this->property, '=', $filterValue),
                    AdvanceOperator::NOT_EQUALS => $query->whereDate($this->property, '!=', $filterValue),
                    AdvanceOperator::BEFORE, AdvanceOperator::LESS_THAN => $query->whereDate($this->property, '<', $filterValue),
                    AdvanceOperator::AFTER, AdvanceOperator::GREATER_THAN => $query->whereDate($this->property, '>', $filterValue),
                    AdvanceOperator::EQUAL_OR_BEFORE, AdvanceOperator::LESS_THAN_OR_EQUAL => $query->whereDate($this->property, '<=', $filterValue),
                    AdvanceOperator::EQUAL_OR_AFTER, AdvanceOperator::GREATER_THAN_OR_EQUAL => $query->whereDate($this->property, '>=', $filterValue),
                    default => $query,
                };
            }

            private function applyNestedFilter(Builder $query, AdvanceOperator $operator, $value): Builder
            {
                $parts = explode('.', $this->property);
                $column = array_pop($parts);
                $relation = implode('.', $parts);

                return $query->whereHas($relation, function (Builder $q) use ($column, $operator, $value) {
                    // Recursively apply the same logic
                    $filter = new self($column, $this->format);
                    $filter($q, ['op' => $operator->value, 'value' => $value], $column);
                });
            }

            private function applyNestedNullCheck(Builder $query, AdvanceOperator $operator): Builder
            {
                $parts = explode('.', $this->property);
                $column = array_pop($parts);
                $relation = implode('.', $parts);

                return $query->whereHas($relation, function (Builder $q) use ($column, $operator) {
                    match ($operator) {
                        AdvanceOperator::IS_SET, AdvanceOperator::IS_NOT_NULL => $q->whereNotNull($column),
                        AdvanceOperator::IS_NOT_SET, AdvanceOperator::IS_NULL => $q->whereNull($column),
                        default => $q,
                    };
                });
            }
        };
    }
}
