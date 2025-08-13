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
        // Get active filters
        $activeFilters = $this->getActiveFilters();

        // Get current sort from state
        $currentSort = $this->getState('sort', $this->defaultSort());

        // Build a clean request for Spatie QueryBuilder
        $queryParams = [];

        // Add filters to query params
        if (! empty($activeFilters)) {
            foreach ($activeFilters as $attribute => $filter) {
                $queryParams['filter'][$attribute] = $filter;
            }
        }

        // Add sort to query params
        if (! empty($currentSort)) {
            $queryParams['sort'] = implode(',', $currentSort);
        }

        // Add search if exists
        $search = $this->getState('search');
        if (! empty($search)) {
            $queryParams['filter']['search'] = $search;
        }

        // Create a new request with our parameters
        $request = request()->duplicate($queryParams);

        // Get allowed filters and sorts
        $allowedFilters = $this->buildFilters();
        $allowedSorts = $this->sorts();

        // Create QueryBuilder instance
        $query = QueryBuilder::for($this->resource(), $request)
            ->allowedFilters($allowedFilters)
            ->allowedSorts($allowedSorts);

        // Add relationships
        if (! empty($this->with())) {
            $query->with($this->with());
        }

        // Add toggleable columns as allowed fields
        $toggleableFields = $this->toggleableColumns();
        if (! empty($toggleableFields)) {
            $query->allowedFields($toggleableFields);
        }

        // Allow customization
        $query = $this->customizeQuery($query);

        // Paginate and return
        $page = $this->getState('page', $this->pagination()['page']);
        $perPage = $this->getState('perPage', $this->pagination()['per_page']);

        $results = $query->paginate(perPage: $perPage, page: $page);

        // Build pagination links with proper parameters
        $results->appends($this->buildPaginationParams());

        return $results->toArray();
    }

    /**
     * Build filters for QueryBuilder
     */
    protected function buildFilters(): array
    {
        $filters = [];

        // Add custom filter columns
        $filterColumns = $this->filterResolver();
        if (! empty($filterColumns)) {
            $filters = array_merge($filters, $filterColumns);
        }

        // Add global search filter
        $globalSearch = $this->globalSearchResolver();
        if (! empty($globalSearch)) {
            $filters = array_merge($filters, $globalSearch);
        }

        return array_filter($filters, fn ($item) => filled($item));
    }

    /**
     * Build query parameters for pagination links
     */
    protected function buildPaginationParams(): array
    {
        $params = [];
        $tableName = $this->getName();

        // Add active filters with table namespace
        foreach ($this->getActiveFilters() as $attribute => $filter) {
            $params["{$tableName}[filter][{$attribute}][op]"] = $filter['op'];

            // Handle array values
            if (is_array($filter['value'])) {
                foreach ($filter['value'] as $index => $value) {
                    $params["{$tableName}[filter][{$attribute}][value][{$index}]"] = $value;
                }
            } else {
                $params["{$tableName}[filter][{$attribute}][value]"] = $filter['value'];
            }
        }

        // Add search
        if ($search = $this->getState('search')) {
            $params["{$tableName}[search]"] = $search;
        }

        // Add sort
        $sorts = $this->getState('sort', []);
        if (! empty($sorts)) {
            $params["{$tableName}[sort]"] = implode(',', $sorts);
        }

        // Add per page
        $params["{$tableName}[page]"] = $this->getState('page', $this->pagination()['page']);
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
                'filter_count' => $this->countActiveFilters(),
                'sortable_columns' => $this->getSortableColumnNames(),
                'toggleable_columns' => $this->toggleableColumns(),
                'default_sort' => $this->defaultSort(),
                'searchable_columns' => $this->getSearchableColumns(),
            ],
        ];
    }

    /**
     * Get searchable columns
     */
    protected function getSearchableColumns(): array
    {
        return collect($this->columns())
            ->filter(fn (Column $col) => $col->isGlobalSearchable())
            ->map(fn (Column $col) => $col->getName())
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
     * Debug query to see what's happening
     */
    public function debugQuery(): array
    {
        $activeFilters = $this->getActiveFilters();
        $currentSort = $this->getState('sort', $this->defaultSort());

        // Build query params
        $queryParams = [];
        if (! empty($activeFilters)) {
            foreach ($activeFilters as $attribute => $filter) {
                $queryParams['filter'][$attribute] = $filter;
            }
        }
        if (! empty($currentSort)) {
            $queryParams['sort'] = implode(',', $currentSort);
        }

        // Create test query
        $request = request()->duplicate($queryParams);
        $testQuery = QueryBuilder::for($this->resource(), $request)
            ->allowedFilters($this->buildFilters())
            ->allowedSorts($this->sorts());

        return [
            'table_name' => $this->getName(),
            'state' => $this->getState(),
            'active_filters' => $activeFilters,
            'query_params' => $queryParams,
            'request_input' => request()->input($this->getName()),
            'raw_request' => request()->all(),
            'sql' => $testQuery->toSql(),
            'bindings' => $testQuery->getBindings(),
            'count' => $testQuery->count(),
        ];
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
        $activeFilters = $this->getActiveFilters();
        $currentSort = $this->getState('sort', $this->defaultSort());

        $queryParams = [];
        if (! empty($activeFilters)) {
            foreach ($activeFilters as $attribute => $filter) {
                $queryParams['filter'][$attribute] = $filter;
            }
        }
        if (! empty($currentSort)) {
            $queryParams['sort'] = implode(',', $currentSort);
        }

        $request = request()->duplicate($queryParams);

        $query = QueryBuilder::for($this->resource(), $request)
            ->allowedFilters($this->buildFilters())
            ->allowedSorts($this->sorts());

        if (! empty($this->with())) {
            $query->with($this->with());
        }

        return $this->customizeQuery($query)->get()->toArray();
    }

    /**
     * Apply preset filters
     */
    public function applyPreset(array $preset): void
    {
        // Apply filters from preset
        if (isset($preset['filters'])) {
            $this->applyFilters($preset['filters']);
        }

        // Apply sort from preset
        if (isset($preset['sort'])) {
            $this->setState('sort', is_array($preset['sort']) ? $preset['sort'] : [$preset['sort']]);
        }

        // Apply per page from preset
        if (isset($preset['perPage'])) {
            $this->setState('perPage', $preset['perPage']);
        }

        // Apply search from preset
        if (isset($preset['search'])) {
            $this->setState('search', $preset['search']);
        }
    }

    /**
     * Get table as JSON response
     */
    public function toResponse(): \Illuminate\Http\JsonResponse
    {
        return response()->json($this->toSchema());
    }

    /**
     * Get only the data as JSON response
     */
    public function dataResponse(): \Illuminate\Http\JsonResponse
    {
        return response()->json($this->getData());
    }

    /**
     * Check if table has any data
     */
    public function hasData(): bool
    {
        $data = $this->getData();

        return isset($data['data']) && count($data['data']) > 0;
    }

    /**
     * Get total count of records (without pagination)
     */
    public function getTotalCount(): int
    {
        $activeFilters = $this->getActiveFilters();

        $queryParams = [];
        if (! empty($activeFilters)) {
            foreach ($activeFilters as $attribute => $filter) {
                $queryParams['filter'][$attribute] = $filter;
            }
        }

        $request = request()->duplicate($queryParams);

        $query = QueryBuilder::for($this->resource(), $request)
            ->allowedFilters($this->buildFilters());

        if (! empty($this->with())) {
            $query->with($this->with());
        }

        return $this->customizeQuery($query)->count();
    }

    /**
     * Get filtered count (with current filters but without pagination)
     */
    public function getFilteredCount(): int
    {
        return $this->getTotalCount();
    }

    /**
     * Clone table with new state
     */
    public function clone(): static
    {
        $cloned = new static($this->name);
        $cloned->state = $this->state;

        return $cloned;
    }

    /**
     * Set multiple state values at once
     */
    public function setStates(array $states): void
    {
        foreach ($states as $key => $value) {
            $this->setState($key, $value);
        }
    }

    /**
     * Get summary of current table state
     */
    public function getSummary(): array
    {
        return [
            'table' => $this->getName(),
            'total_records' => $this->getTotalCount(),
            'filters_applied' => $this->countActiveFilters(),
            'current_page' => $this->getState('page', 1),
            'per_page' => $this->getState('perPage', $this->pagination()['per_page']),
            'sort' => $this->getState('sort', []),
            'search' => $this->getState('search'),
            'has_data' => $this->hasData(),
        ];
    }

    /**
     * Clear all state and reset to defaults
     */
    public function clearAll(): void
    {
        $this->reset();
        $this->state = [];
        $this->applyStateFromRequest();
    }

    /**
     * Get URL for current state
     */
    public function getUrl(string $baseUrl = ''): string
    {
        $params = $this->buildPaginationParams();
        $queryString = http_build_query($params);

        return $baseUrl.(str_contains($baseUrl, '?') ? '&' : '?').$queryString;
    }

    /**
     * Apply state from URL parameters
     */
    public function applyFromUrl(string $url): void
    {
        $parsedUrl = parse_url($url);

        if (isset($parsedUrl['query'])) {
            parse_str($parsedUrl['query'], $params);

            $tableName = $this->getName();
            $tableParams = $params[$tableName] ?? $params;

            // Apply filters
            if (isset($tableParams['filter'])) {
                foreach ($tableParams['filter'] as $attribute => $filter) {
                    if ($attribute === 'search') {
                        $this->setState('search', $filter);
                    } elseif (is_array($filter) && isset($filter['op']) && isset($filter['value'])) {
                        $this->applyFilter($attribute, $filter['value'], $filter['op']);
                    }
                }
            }

            // Apply sort
            if (isset($tableParams['sort'])) {
                $this->setState('sort', self::parseSort($tableParams['sort']));
            }

            // Apply pagination
            if (isset($tableParams['per_page'])) {
                $this->setState('perPage', (int) $tableParams['per_page']);
            }

            if (isset($tableParams['page'])) {
                $this->setState('page', (int) $tableParams['page']);
            }
        }
    }

    /**
     * Get available presets for this table
     */
    public function getPresets(): array
    {
        return [
            'default' => [
                'name' => 'Default',
                'filters' => [],
                'sort' => $this->defaultSort(),
                'perPage' => $this->pagination()['per_page'],
            ],
            'all' => [
                'name' => 'All Records',
                'filters' => [],
                'sort' => $this->defaultSort(),
                'perPage' => 9999,
            ],
        ];
    }

    /**
     * Load a specific preset
     */
    public function loadPreset(string $presetName): void
    {
        $presets = $this->getPresets();

        if (isset($presets[$presetName])) {
            $this->applyPreset($presets[$presetName]);
        }
    }

    /**
     * Get columns configuration
     */
    public function getColumnsConfig(): array
    {
        return collect($this->columns())
            ->map(fn (Column $column) => [
                'name' => $column->getName(),
                'label' => $column->getLabel(),
                'sortable' => $column->isSortable(),
                'searchable' => $column->isGlobalSearchable(),
                'toggleable' => $column->isToggleable(),
                'hidden' => $column->isHidden(),
            ])
            ->toArray();
    }

    /**
     * Get filters configuration
     */
    public function getFiltersConfig(): array
    {
        return $this->getFiltersArray();
    }

    /**
     * Validate table configuration
     */
    public function validate(): array
    {
        $errors = [];

        // Check if resource is valid
        try {
            $resource = $this->resource();
            if (is_string($resource) && ! class_exists($resource)) {
                $errors[] = "Resource class {$resource} does not exist";
            }
        } catch (\Exception $e) {
            $errors[] = 'Error loading resource: '.$e->getMessage();
        }

        // Check if columns are defined
        if (empty($this->columns())) {
            $errors[] = 'No columns defined';
        }

        // Check if sortable columns exist
        $sortableColumns = $this->getSortableColumnNames();
        $defaultSort = $this->defaultSort();
        foreach ($defaultSort as $sort) {
            $column = ltrim($sort, '-');
            if (! in_array($column, $sortableColumns)) {
                $errors[] = "Default sort column '{$column}' is not sortable";
            }
        }

        return $errors;
    }

    /**
     * Get table metadata
     */
    public function getMetadata(): array
    {
        return [
            'name' => $this->getName(),
            'resource' => is_string($this->resource()) ? $this->resource() : get_class($this->resource()->getModel()),
            'columns_count' => count($this->columns()),
            'filters_count' => count($this->filters()),
            'sortable_columns' => $this->getSortableColumnNames(),
            'searchable_columns' => $this->getSearchableColumns(),
            'toggleable_columns' => $this->toggleableColumns(),
            'default_sort' => $this->defaultSort(),
            'default_pagination' => $this->pagination(),
            'has_relationships' => ! empty($this->with()),
            'relationships' => $this->with(),
        ];
    }

    /**
     * Quick stats about the table
     */
    public function getStats(): array
    {
        $data = $this->getData();

        return [
            'current_page' => $data['current_page'] ?? 1,
            'last_page' => $data['last_page'] ?? 1,
            'per_page' => $data['per_page'] ?? $this->pagination()['per_page'],
            'total' => $data['total'] ?? 0,
            'from' => $data['from'] ?? 0,
            'to' => $data['to'] ?? 0,
            'filters_active' => $this->countActiveFilters(),
            'has_more_pages' => ($data['current_page'] ?? 1) < ($data['last_page'] ?? 1),
        ];
    }
}
