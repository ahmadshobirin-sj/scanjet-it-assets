<?php

namespace App\Tables\Traits;

use App\Tables\Enums\AdvanceOperator;
use App\Tables\FilterColumns\BooleanFilterColumn;
use App\Tables\FilterColumns\FilterColumn;
use App\Tables\FilterColumns\SelectFilterColumn;
use Illuminate\Support\Collection;

trait HasFilter
{
    protected ?Collection $filterColumns = null;

    /**
     * Define filter columns for the table
     */
    abstract protected function filters(): array;

    /**
     * Get filter columns collection
     */
    public function getFilterColumns(): Collection
    {
        if ($this->filterColumns === null) {
            $this->filterColumns = collect($this->filters());
        }

        return $this->filterColumns;
    }

    /**
     * Return filters for QueryBuilder
     */
    public function filterResolver(): array
    {
        return $this->getFilterColumns()
            ->map(fn (FilterColumn $column) => $column->getAllowedFilter())
            ->values()
            ->toArray();
    }

    /**
     * Get filter columns as array for frontend
     */
    public function getFiltersArray(): array
    {
        return $this->getFilterColumns()
            ->map(fn (FilterColumn $column) => $column->toArray())
            ->values()
            ->toArray();
    }

    /**
     * Get filter column by name
     */
    public function getFilterColumn(string $name): ?FilterColumn
    {
        return $this->getFilterColumns()
            ->first(fn (FilterColumn $column) => $column->getName() === $name);
    }

    /**
     * Get default filters state
     */
    public function defaultFilters(): array
    {
        $defaults = [];

        foreach ($this->getFilterColumns() as $column) {
            $attribute = $column->getName();
            $defaults[$attribute] = [
                'enabled' => $column->hasDefaultValue(),
                'value' => $column->getDefault(),
                'clause' => $column->getDefaultClause(),
            ];
        }

        return $defaults;
    }

    /**
     * Build active filters from state
     */
    public function getActiveFilters(): array
    {
        $state = $this->getState('filters', []);
        $activeFilters = [];

        foreach ($state as $attribute => $filter) {
            if ($filter['enabled'] ?? false) {
                $activeFilters[$attribute] = [
                    'op' => $filter['clause'],
                    'value' => $filter['value'],
                ];
            }
        }

        return $activeFilters;
    }

    /**
     * Check if any filter is active
     */
    public function hasActiveFilters(): bool
    {
        $filters = $this->getState('filters', []);

        return collect($filters)
            ->contains(fn ($filter) => $filter['enabled'] ?? false);
    }

    /**
     * Clear all filters
     */
    public function clearFilters(): void
    {
        $this->setState('filters', $this->defaultFilters());
    }

    /**
     * Apply filter to specific column
     */
    public function applyFilter(string $attribute, mixed $value, ?string $clause = null): void
    {
        $filters = $this->getState('filters', []);
        $column = $this->getFilterColumn($attribute);

        if (! $column) {
            return;
        }

        // Validate clause if provided
        if ($clause && ! $this->isValidClause($attribute, $clause)) {
            throw new \InvalidArgumentException("Invalid clause '{$clause}' for column '{$attribute}'");
        }

        $filters[$attribute] = [
            'enabled' => $value !== null && $value !== '',
            'value' => $value,
            'clause' => $clause ?? $column->getDefaultClause(),
        ];

        $this->setState('filters', $filters);
    }

    /**
     * Remove filter from specific column
     */
    public function removeFilter(string $attribute): void
    {
        $filters = $this->getState('filters', []);

        if (isset($filters[$attribute])) {
            $filters[$attribute]['enabled'] = false;
            $filters[$attribute]['value'] = null;
        }

        $this->setState('filters', $filters);
    }

    /**
     * Get filter summary for display
     */
    public function getFilterSummary(): array
    {
        $summary = [];
        $filters = $this->getState('filters', []);

        foreach ($filters as $attribute => $filter) {
            if ($filter['enabled'] ?? false) {
                $column = $this->getFilterColumn($attribute);
                if ($column) {
                    $summary[] = [
                        'attribute' => $attribute,
                        'label' => $column->getLabel(),
                        'value' => $this->formatFilterValue($column, $filter['value']),
                        'clause' => $filter['clause'],
                        'clause_label' => $this->getClauseLabel($filter['clause']),
                    ];
                }
            }
        }

        return $summary;
    }

    /**
     * Format filter value for display
     */
    protected function formatFilterValue(FilterColumn $column, mixed $value): string
    {
        if (is_array($value)) {
            // For BETWEEN, IN operations
            return implode(' - ', $value);
        }

        if ($column instanceof SelectFilterColumn) {
            $options = $column->getOptions();
            $option = collect($options)->firstWhere('value', $value);

            return $option['label'] ?? $value;
        }

        if ($column instanceof BooleanFilterColumn) {
            return $value ? 'Yes' : 'No';
        }

        return (string) $value;
    }

    /**
     * Get human-readable clause label using AdvanceOperator enum
     */
    protected function getClauseLabel(string $clause): string
    {
        try {
            $operator = AdvanceOperator::from($clause);

            return strtolower($operator->label());
        } catch (\ValueError $e) {
            // Fallback for any unmapped clauses
            return str_replace('_', ' ', $clause);
        }
    }

    /**
     * Validate if a clause is valid for a column
     */
    public function isValidClause(string $attribute, string $clause): bool
    {
        $column = $this->getFilterColumn($attribute);

        if (! $column) {
            return false;
        }

        return in_array($clause, $column->getClauses());
    }

    /**
     * Get available operators for a specific column
     */
    public function getAvailableOperators(string $attribute): array
    {
        $column = $this->getFilterColumn($attribute);

        if (! $column) {
            return [];
        }

        $operators = [];
        foreach ($column->getClauses() as $clause) {
            try {
                $operator = AdvanceOperator::from($clause);
                $operators[] = [
                    'value' => $operator->value,
                    'label' => $operator->label(),
                ];
            } catch (\ValueError $e) {
                // Fallback for unmapped operators
                $operators[] = [
                    'value' => $clause,
                    'label' => $this->getClauseLabel($clause),
                ];
            }
        }

        return $operators;
    }

    /**
     * Apply multiple filters at once
     */
    public function applyFilters(array $filters): void
    {
        foreach ($filters as $attribute => $filterData) {
            if (is_array($filterData)) {
                $this->applyFilter(
                    $attribute,
                    $filterData['value'] ?? null,
                    $filterData['op'] ?? $filterData['clause'] ?? null
                );
            } else {
                $this->applyFilter($attribute, $filterData);
            }
        }
    }

    /**
     * Get filters as query string parameters
     */
    public function getFiltersAsQueryParams(): array
    {
        $params = [];

        foreach ($this->getActiveFilters() as $attribute => $filter) {
            $params["filter[{$attribute}][op]"] = $filter['op'];
            $params["filter[{$attribute}][value]"] = $filter['value'];
        }

        return $params;
    }

    /**
     * Check if a specific filter is active
     */
    public function isFilterActive(string $attribute): bool
    {
        $filters = $this->getState('filters', []);

        return $filters[$attribute]['enabled'] ?? false;
    }

    /**
     * Get filter value for a specific attribute
     */
    public function getFilterValue(string $attribute): mixed
    {
        $filters = $this->getState('filters', []);

        return $filters[$attribute]['value'] ?? null;
    }

    /**
     * Get filter clause for a specific attribute
     */
    public function getFilterClause(string $attribute): ?string
    {
        $filters = $this->getState('filters', []);

        return $filters[$attribute]['clause'] ?? null;
    }

    /**
     * Count active filters
     */
    public function countActiveFilters(): int
    {
        $filters = $this->getState('filters', []);

        return collect($filters)
            ->filter(fn ($filter) => $filter['enabled'] ?? false)
            ->count();
    }

    /**
     * Toggle filter state
     */
    public function toggleFilter(string $attribute): void
    {
        $filters = $this->getState('filters', []);

        if (isset($filters[$attribute])) {
            $filters[$attribute]['enabled'] = ! ($filters[$attribute]['enabled'] ?? false);
            $this->setState('filters', $filters);
        }
    }
}
