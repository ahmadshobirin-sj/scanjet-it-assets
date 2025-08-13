<?php

namespace App\Tables;

use App\Tables\Columns\Column;
use App\Tables\FilterColumns\FilterColumn;
use App\Tables\Traits\HasFilter;
use App\Tables\Traits\HasGlobalSearch;
use App\Tables\Traits\HasSortable;
use App\Tables\Traits\HasToggleable;
use App\Tables\Traits\TableState;
use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\QueryBuilder;

abstract class NewTable
{
    use HasFilter;
    use HasGlobalSearch;
    use HasSortable;
    use HasToggleable;
    use TableState;

    protected string $name = 'default';

    public function __construct(string $name)
    {
        $this->name = $name;
        $this->applyStateFromRequest();
    }

    public static function make(string $name): static
    {
        return new static($name);
    }

    public function getName(): string
    {
        return $this->name;
    }

    abstract public function resource(): Builder|string;

    /**
     * Return array of Column instances.
     *
     * @return Column[]
     */
    abstract public function columns(): array;

    /**
     * Return array of FilterColumn instances.
     *
     * @return FilterColumn[]
     */
    abstract public function filters(): array;

    public function with(): array
    {
        return [];
    }

    public function pagination(): array
    {
        return [
            'per_page' => 10,
            'page' => 1,
        ];
    }

    /**
     * Build and execute the query
     */
    public function query()
    {
        // Build active filters for the request
        $activeFilters = $this->buildActiveFiltersForRequest();

        // Create a custom request with active filters
        $tableParams = $this->buildTableParams($activeFilters);
        $request = request()->duplicate($tableParams);

        // Build filters array for Spatie QueryBuilder
        $filters = $this->buildFilters();

        // Get sorts from columns
        $allowedSorts = $this->sorts();

        // Create QueryBuilder instance
        $query = QueryBuilder::for($this->resource(), $request)
            ->allowedFilters($filters)
            ->allowedSorts($allowedSorts);


        $currentSort = $this->getState('sort', []);
        if (empty($currentSort)) {
            $defaultSorts = $this->defaultSort();
            foreach ($defaultSorts as $sort) {
                $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
                $field = ltrim($sort, '-');
                $query->defaultSort($field, $direction);
            }
        }
        // Add relationships
        if (!empty($this->with())) {
            $query->with($this->with());
        }
        // Add toggleable columns as allowed fields
        $toggleableFields = $this->toggleableColumns();
        if (!empty($toggleableFields)) {
            $query->allowedFields($toggleableFields);
        }
        // Allow customization
        $query = $this->customizeQuery($query);
        // Paginate and return
        $perPage = $this->getState('perPage', $this->pagination()['per_page']);

        return $query
            ->paginate($perPage)
            ->appends($this->buildQueryParams())
            ->toArray();
    }

    /**
     * Build active filters for the request including defaults
     */
    protected function buildActiveFiltersForRequest(): array
    {
        $filters = $this->getState('filters', []);
        $activeFilters = [];

        foreach ($filters as $attribute => $filter) {
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
     * Build table parameters including filters
     */
    protected function buildTableParams(array $activeFilters): array
    {
        $params = request()->input($this->getName(), []);

        // Merge active filters (including defaults) into params
        if (!empty($activeFilters)) {
            $params['filter'] = array_merge(
                $params['filter'] ?? [],
                $activeFilters
            );
        }

        return $params;
    }

    /**
     * Build filters for QueryBuilder
     */
    protected function buildFilters(): array
    {
        $filters = [];

        // Add custom filter columns
        $filterColumns = $this->filterResolver();
        if (!empty($filterColumns)) {
            $filters = array_merge($filters, $filterColumns);
        }

        // Add global search filter
        $globalSearch = $this->globalSearchResolver();
        if (!empty($globalSearch)) {
            $filters = array_merge($filters, $globalSearch);
        }

        return array_filter($filters, fn($item) => filled($item));
    }

    /**
     * Build query parameters for pagination links
     */
    protected function buildQueryParams(): array
    {
        $params = [];
        $tableName = $this->getName();

        // Add active filters
        foreach ($this->getActiveFilters() as $attribute => $filter) {
            $params["{$tableName}[filter][{$attribute}][op]"] = $filter['op'];
            $params["{$tableName}[filter][{$attribute}][value]"] = $filter['value'];
        }

        // Add search
        if ($search = $this->getState('search')) {
            $params["{$tableName}[filter][search]"] = $search;
        }

        // Add sort
        if ($sort = $this->getState('sort')) {
            $params["{$tableName}[sort]"] = implode(',', $sort);
        }

        // Add per page
        $params["{$tableName}[per_page]"] = $this->getState('perPage', $this->pagination()['per_page']);

        return $params;
    }

    /**
     * Customize query before execution
     */
    public function customizeQuery(QueryBuilder $query): QueryBuilder
    {
        return $query;
    }

    /**
     * Map columns to schema for frontend
     */
    public function mapColumnsToSchema(): array
    {
        return array_reduce($this->columns(), function ($carry, Column $column) {
            if ($column->isHidden()) {
                return $carry;
            }
            $carry[] = $column->toSchema();
            return $carry;
        }, []);
    }

    /**
     * Map filters to schema for frontend
     */
    public function mapFiltersToSchema(): array
    {
        return $this->getFiltersArray();
    }

    /**
     * Get complete table schema
     */
    public function toSchema(): array
    {
        return [
            'name' => $this->getName(),
            'columns' => $this->mapColumnsToSchema(),
            'filters' => $this->mapFiltersToSchema(),
            'state' => $this->getFullState(),
            'results' => $this->query(),
            'meta' => [
                'has_filters' => $this->hasActiveFilters(),
                'filter_summary' => $this->getFilterSummary(),
                'sortable_columns' => $this->getSortableColumnNames(), // Use string names for meta
                'toggleable_columns' => $this->toggleableColumns(),
                'default_sort' => $this->defaultSort(),
                'searchable_columns' => $this->getSearchableColumns(),
            ]
        ];
    }

    /**
     * Get searchable columns
     */
    protected function getSearchableColumns(): array
    {
        return collect($this->columns())
            ->filter(fn(Column $col) => $col->isGlobalSearchable())
            ->map(fn(Column $col) => $col->getName())
            ->values()
            ->all();
    }

    /**
     * Get data without schema (just results)
     */
    public function getData(): array
    {
        return $this->query();
    }

    /**
     * Reset all filters and state
     */
    public function reset(): void
    {
        $this->clearFilters();
        $this->setState('search', null);
        $this->setState('sort', $this->defaultSort());
        $this->setState('page', 1);
        $this->setState('perPage', $this->pagination()['per_page']);
    }

    /**
     * Export data (without pagination)
     */
    public function export(): array
    {
        $tableParams = request()->input($this->getName(), []);
        $request = request()->duplicate($tableParams);

        $filters = $this->buildFilters();

        $query = QueryBuilder::for($this->resource(), $request)
            ->allowedFilters($filters)
            ->allowedSorts($this->sorts());

        if (!empty($this->with())) {
            $query->with($this->with());
        }

        return $this->customizeQuery($query)->get()->toArray();
    }
}
