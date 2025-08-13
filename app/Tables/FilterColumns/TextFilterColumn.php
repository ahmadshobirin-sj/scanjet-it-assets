<?php

namespace App\Tables\FilterColumns;

use App\Tables\Enums\AdvanceOperator;
use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\Filters\Filter;

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

    protected function createFilter(): Filter
    {
        return new class($this->getName(), $this->caseSensitive) implements Filter
        {
            public function __construct(
                private string $property,
                private bool $caseSensitive
            ) {}

            public function __invoke(Builder $query, $value, string $property): Builder
            {
                if (! is_array($value) || ! isset($value['op'])) {
                    return $query;
                }

                $operator = $value['op'] ?? null;
                $filterValue = $value['value'] ?? null;

                if (! $operator || $filterValue === null || $filterValue === '') {
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

                return $this->applyTextOperator($query, $this->property, $operatorEnum, $filterValue);
            }

            private function applyNestedFilter(Builder $query, AdvanceOperator $operator, $value): Builder
            {
                $parts = explode('.', $this->property);
                $column = array_pop($parts);
                $relation = implode('.', $parts);

                return $query->whereHas($relation, function (Builder $q) use ($column, $operator, $value) {
                    $this->applyTextOperator($q, $column, $operator, $value);
                });
            }

            private function applyTextOperator(Builder $query, string $column, AdvanceOperator $operator, $value): Builder
            {
                // Convert to lowercase for case-insensitive search if needed
                if (! $this->caseSensitive && in_array($operator, [
                    AdvanceOperator::CONTAINS,
                    AdvanceOperator::NOT_CONTAINS,
                    AdvanceOperator::STARTS_WITH,
                    AdvanceOperator::ENDS_WITH,
                ])) {
                    $value = strtolower($value);
                }

                return match ($operator) {
                    AdvanceOperator::EQUALS => $query->where($column, '=', $value),
                    AdvanceOperator::NOT_EQUALS => $query->where($column, '!=', $value),
                    AdvanceOperator::CONTAINS => $query->where($column, 'LIKE', '%'.$value.'%'),
                    AdvanceOperator::NOT_CONTAINS => $query->where($column, 'NOT LIKE', '%'.$value.'%'),
                    AdvanceOperator::STARTS_WITH => $query->where($column, 'LIKE', $value.'%'),
                    AdvanceOperator::ENDS_WITH => $query->where($column, 'LIKE', '%'.$value),
                    default => $query,
                };
            }
        };
    }
}
