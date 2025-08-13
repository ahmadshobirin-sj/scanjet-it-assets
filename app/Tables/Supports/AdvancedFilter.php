<?php

namespace App\Tables\Supports;

use App\Tables\Enums\AdvanceOperator;
use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\Filters\Filter;

/**
 * Generic Advanced Filter for basic operations
 * Used as fallback when FilterColumns don't define their own filter
 */
class AdvancedFilter implements Filter
{
    protected string $property;

    public function __construct(string $property)
    {
        $this->property = $property;
    }

    public function __invoke(Builder $query, $value, string $property): Builder
    {
        // If value is not an array with 'op' and 'value', skip
        if (! is_array($value) || ! isset($value['op'])) {
            return $query;
        }

        $operator = $value['op'] ?? null;
        $filterValue = $value['value'] ?? null;

        if (! $operator) {
            return $query;
        }

        try {
            $operatorEnum = AdvanceOperator::from($operator);
        } catch (\ValueError $e) {
            return $query;
        }

        // Check if property contains dot notation for nested relations
        if (str_contains($this->property, '.')) {
            return $this->applyNestedFilter($query, $this->property, $operatorEnum, $filterValue);
        }

        // Apply filter to direct property
        return $this->applyDirectFilter($query, $this->property, $operatorEnum, $filterValue);
    }

    /**
     * Apply filter to nested relation
     */
    protected function applyNestedFilter(Builder $query, string $property, AdvanceOperator $operator, $filterValue): Builder
    {
        $parts = explode('.', $property);
        $column = array_pop($parts);
        $relation = implode('.', $parts);

        return $query->whereHas($relation, function (Builder $q) use ($column, $operator, $filterValue) {
            $this->applyDirectFilter($q, $column, $operator, $filterValue);
        });
    }

    /**
     * Apply filter directly to a column
     * This is a generic implementation for basic operations
     */
    protected function applyDirectFilter(Builder $query, string $column, AdvanceOperator $operator, $filterValue): Builder
    {
        // Handle operators that don't require values
        if (! $operator->requiresValue()) {
            return match ($operator) {
                AdvanceOperator::IS_NULL, AdvanceOperator::IS_NOT_SET => $query->whereNull($column),
                AdvanceOperator::IS_NOT_NULL, AdvanceOperator::IS_SET => $query->whereNotNull($column),
                default => $query,
            };
        }

        // Handle array value operators
        if ($operator->requiresArrayValue()) {
            $values = is_array($filterValue) ? $filterValue : explode(',', $filterValue);

            // Validate array has required values for BETWEEN operations
            if (in_array($operator, [AdvanceOperator::BETWEEN, AdvanceOperator::NOT_BETWEEN]) && count($values) < 2) {
                return $query;
            }

            return match ($operator) {
                AdvanceOperator::BETWEEN => $query->whereBetween($column, [$values[0], $values[1]]),
                AdvanceOperator::NOT_BETWEEN => $query->whereNotBetween($column, [$values[0], $values[1]]),
                AdvanceOperator::IN => $query->whereIn($column, $values),
                AdvanceOperator::NOT_IN => $query->whereNotIn($column, $values),
                default => $query,
            };
        }

        // Handle boolean operators
        if (in_array($operator, [AdvanceOperator::IS_TRUE, AdvanceOperator::IS_FALSE])) {
            return match ($operator) {
                AdvanceOperator::IS_TRUE => $query->where($column, '=', true),
                AdvanceOperator::IS_FALSE => $query->where($column, '=', false),
                default => $query,
            };
        }

        // Handle string/text operators
        if ($this->isTextOperator($operator)) {
            return $this->applyTextOperator($query, $column, $operator, $filterValue);
        }

        // Handle basic comparison operators
        return match ($operator) {
            AdvanceOperator::EQUALS => $query->where($column, '=', $filterValue),
            AdvanceOperator::NOT_EQUALS => $query->where($column, '!=', $filterValue),
            AdvanceOperator::GREATER_THAN, AdvanceOperator::AFTER => $query->where($column, '>', $filterValue),
            AdvanceOperator::GREATER_THAN_OR_EQUAL, AdvanceOperator::EQUAL_OR_AFTER => $query->where($column, '>=', $filterValue),
            AdvanceOperator::LESS_THAN, AdvanceOperator::BEFORE => $query->where($column, '<', $filterValue),
            AdvanceOperator::LESS_THAN_OR_EQUAL, AdvanceOperator::EQUAL_OR_BEFORE => $query->where($column, '<=', $filterValue),
            default => $query,
        };
    }

    /**
     * Check if operator is text-specific
     */
    protected function isTextOperator(AdvanceOperator $operator): bool
    {
        return in_array($operator, [
            AdvanceOperator::CONTAINS,
            AdvanceOperator::NOT_CONTAINS,
            AdvanceOperator::STARTS_WITH,
            AdvanceOperator::ENDS_WITH,
        ]);
    }

    /**
     * Apply text-specific operators
     */
    protected function applyTextOperator(Builder $query, string $column, AdvanceOperator $operator, $value): Builder
    {
        // Ensure value is string
        $stringValue = (string) $value;

        return match ($operator) {
            AdvanceOperator::CONTAINS => $query->where($column, 'LIKE', '%'.$stringValue.'%'),
            AdvanceOperator::NOT_CONTAINS => $query->where($column, 'NOT LIKE', '%'.$stringValue.'%'),
            AdvanceOperator::STARTS_WITH => $query->where($column, 'LIKE', $stringValue.'%'),
            AdvanceOperator::ENDS_WITH => $query->where($column, 'LIKE', '%'.$stringValue),
            default => $query,
        };
    }
}
