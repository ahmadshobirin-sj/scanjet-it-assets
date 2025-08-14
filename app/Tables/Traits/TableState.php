<?php

namespace App\Tables\Traits;

use App\Tables\Enums\AdvanceOperator;

trait TableState
{
    use HasFilter;

    protected array $state = [];

    public function applyStateFromRequest(): void
    {
        // Ambil nama tabel
        $tableName = $this->getName();

        // Ambil data dari request dengan namespace tabel
        $requestData = request()->input($tableName, request()->all());

        // Parse filters dari request
        $filters = $this->parseFilters($requestData['filter'] ?? []);
        $this->state['filters'] = $this->mergeWithDefaultFilters($filters);

        // Parse sort dari request
        $requestSort = $requestData['sort'] ?? request()->query('sort', '');
        $this->state['sort'] = ! empty($requestSort)
            ? self::parseSort($requestSort)
            : $this->defaultSort();

        // Parse pagination
        $this->state['page'] = (int) ($requestData['page'] ?? request()->query('page', $this->pagination()['page']));
        $this->state['perPage'] = (int) ($requestData['per_page'] ?? request()->query('per_page', $this->pagination()['per_page']));

        // Parse search
        $this->state['search'] = $requestData['search'] ?? request()->query('search');
    }

    protected function parseFilters(array $requestFilters): array
    {
        $parsedFilters = [];

        foreach ($requestFilters as $attribute => $filter) {
            // Skip 'search' as it's handled separately
            if ($attribute === 'search') {
                continue;
            }

            if (is_array($filter)) {
                // ⚠️ FIX: Check structure more carefully

                // Case 1: Filter with op and value structure
                // Example: ['op' => 'equals', 'value' => 'something']
                if (isset($filter['op']) && array_key_exists('value', $filter)) {
                    $parsedFilters[$attribute] = [
                        'enabled' => $this->isValueValid($filter['value']),
                        'value' => $filter['value'],
                        'clause' => $filter['op'],
                    ];
                }
                // Case 2: Filter with only op (for operators that don't need value)
                // Example: ['op' => 'is_not_set']
                elseif (isset($filter['op']) && ! array_key_exists('value', $filter)) {
                    // Check if this operator requires a value
                    try {
                        $operatorEnum = AdvanceOperator::from($filter['op']);
                        if (! $operatorEnum->requiresValue()) {
                            // This is valid - operator doesn't need value
                            $parsedFilters[$attribute] = [
                                'enabled' => true,
                                'value' => null,
                                'clause' => $filter['op'],
                            ];
                        } else {
                            // Operator requires value but none provided - skip
                            $parsedFilters[$attribute] = [
                                'enabled' => false,
                                'value' => null,
                                'clause' => $filter['op'],
                            ];
                        }
                    } catch (\ValueError $e) {
                        // Invalid operator - skip
                        continue;
                    }
                }
                // Case 3: Alternative format with 'clause' instead of 'op'
                elseif (isset($filter['clause']) && array_key_exists('value', $filter)) {
                    $parsedFilters[$attribute] = [
                        'enabled' => $this->isValueValid($filter['value']),
                        'value' => $filter['value'],
                        'clause' => $filter['clause'],
                    ];
                }
                // Case 4: Direct value array (for backward compatibility)
                // Example: ['2024-01-01', '2024-12-31']
                else {
                    // Check if all elements are non-associative (numeric keys)
                    $isNumericArray = array_keys($filter) === range(0, count($filter) - 1);

                    if ($isNumericArray) {
                        $parsedFilters[$attribute] = [
                            'enabled' => $this->isValueValid($filter),
                            'value' => $filter,
                            'clause' => $this->getDefaultClause($attribute),
                        ];
                    }
                    // Otherwise, it might be malformed - skip
                }
            } else {
                // Simple filter value (string, number, etc.)
                $parsedFilters[$attribute] = [
                    'enabled' => $this->isValueValid($filter),
                    'value' => $filter,
                    'clause' => $this->getDefaultClause($attribute),
                ];
            }
        }

        return $parsedFilters;
    }

    protected function mergeWithDefaultFilters(array $filters): array
    {
        $mergedFilters = [];

        foreach ($this->getFilterColumns() as $column) {
            $attribute = $column->getName();

            // Check if filter exists in request
            if (isset($filters[$attribute])) {
                // Use request filter
                $mergedFilters[$attribute] = $filters[$attribute];
            } else {
                // Use default filter if column has default value
                if ($column->hasDefaultValue()) {
                    $mergedFilters[$attribute] = [
                        'enabled' => true,
                        'value' => $column->getDefault(),
                        'clause' => $column->getDefaultClause(),
                    ];
                } else {
                    // No filter applied
                    $mergedFilters[$attribute] = [
                        'enabled' => false,
                        'value' => null,
                        'clause' => $column->getDefaultClause(),
                    ];
                }
            }
        }

        return $mergedFilters;
    }

    protected function isValueValid($value): bool
    {
        // Null is valid for some operators (will be checked later)
        if ($value === null) {
            return true;
        }

        if ($value === '') {
            return false;
        }

        if (is_array($value)) {
            // Check if all array values are valid
            return count(array_filter($value, fn ($v) => $v !== null && $v !== '')) > 0;
        }

        return true;
    }

    protected function getDefaultClause(string $attribute): string
    {
        $column = $this->getFilterColumn($attribute);

        return $column ? $column->getDefaultClause() : AdvanceOperator::EQUALS->value;
    }

    public function getState(?string $key = null, mixed $default = null): mixed
    {
        if ($this->state === []) {
            $this->applyStateFromRequest();
        }

        if ($key === null) {
            return $this->state;
        }

        return $this->state[$key] ?? $default;
    }

    public function setState(string $key, mixed $value): void
    {
        $this->state[$key] = $value;
    }

    public function getFullState(): array
    {
        return [
            'filters' => $this->getState('filters', []),
            'perPage' => $this->getState('perPage', $this->pagination()['per_page']),
            'page' => $this->getState('page', $this->pagination()['page']),
            'search' => $this->getState('search'),
            'sort' => $this->getState('sort', []),
        ];
    }

    private static function parseSort(string $sort): array
    {
        return array_filter(explode(',', $sort));
    }

    abstract protected function defaultSort(): array;

    abstract protected function pagination(): array;
}
