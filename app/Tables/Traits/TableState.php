<?php

namespace App\Tables\Traits;

use App\Tables\Enums\AdvanceOperator;

/**
 * TableState
 * ----------
 * Menyimpan & mem-parsing state tabel dari request:
 * - filters (op/value) dengan default & validasi operator
 * - sort (array dari string)
 * - pagination (page, perPage)
 * - search (global search)
 *
 * Catatan:
 * - parseFilters() fleksibel: mendukung beberapa bentuk payload.
 * - mergeWithDefaultFilters() memastikan semua FilterColumn punya state.
 */
trait TableState
{
    use HasFilter;

    protected array $state = [];

    /**
     * Ambil state awal dari request (dengan namespace nama tabel jika ada).
     * Dipanggil saat konstruksi Table & saat clearAll().
     */
    public function applyStateFromRequest(): void
    {
        $tableName = $this->getName();
        $requestData = request()->input($tableName, request()->all());

        // Filters
        $filters = $this->parseFilters($requestData['filter'] ?? []);
        $this->state['filters'] = $this->mergeWithDefaultFilters($filters);

        // Sort
        $requestSort = $requestData['sort'] ?? request()->query('sort', '');
        $this->state['sort'] = ! empty($requestSort)
            ? self::parseSort($requestSort)
            : $this->defaultSort();

        // Pagination
        $this->state['page'] = (int) ($requestData['page'] ?? request()->query('page', $this->pagination()['page']));
        $this->state['perPage'] = (int) ($requestData['per_page'] ?? request()->query('per_page', $this->pagination()['per_page']));

        // Global search
        $this->state['search'] = $requestData['search'] ?? request()->query('search');
    }

    /**
     * Parser fleksibel untuk berbagai format filter dari FE.
     * Menghasilkan bentuk normal:
     *   [attr => ['enabled'=>bool, 'value'=>mixed, 'clause'=>string]]
     */
    protected function parseFilters(array $requestFilters): array
    {
        $parsed = [];

        foreach ($requestFilters as $attribute => $filter) {
            // 'search' ditangani terpisah (HasGlobalSearch)
            if ($attribute === 'search') {
                continue;
            }

            if (is_array($filter)) {
                // Format A: ['op' => 'equals', 'value' => 'abc']
                if (isset($filter['op']) && array_key_exists('value', $filter)) {
                    $parsed[$attribute] = [
                        'enabled' => $this->isValueValid($filter['value']),
                        'value' => $filter['value'],
                        'clause' => $filter['op'],
                    ];

                    continue;
                }

                // Format B: hanya 'op' (operator tak butuh value)
                if (isset($filter['op']) && ! array_key_exists('value', $filter)) {
                    try {
                        $op = AdvanceOperator::from($filter['op']);
                        $parsed[$attribute] = [
                            'enabled' => ! $op->requiresValue(),
                            'value' => null,
                            'clause' => $op->value,
                        ];
                    } catch (\ValueError $e) {
                        // operator invalid → skip
                    }

                    continue;
                }

                // Format C: ['clause' => 'equals', 'value' => 'abc'] (alias)
                if (isset($filter['clause']) && array_key_exists('value', $filter)) {
                    $parsed[$attribute] = [
                        'enabled' => $this->isValueValid($filter['value']),
                        'value' => $filter['value'],
                        'clause' => $filter['clause'],
                    ];

                    continue;
                }

                // Format D: array nilai langsung (untuk BETWEEN/IN)
                $isNumericArray = array_keys($filter) === range(0, count($filter) - 1);
                if ($isNumericArray) {
                    $parsed[$attribute] = [
                        'enabled' => $this->isValueValid($filter),
                        'value' => $filter,
                        'clause' => $this->getDefaultClause($attribute),
                    ];
                }
                // selain itu dianggap malformed → skip
            } else {
                // Nilai sederhana (string/number/bool)
                $parsed[$attribute] = [
                    'enabled' => $this->isValueValid($filter),
                    'value' => $filter,
                    'clause' => $this->getDefaultClause($attribute),
                ];
            }
        }

        return $parsed;
    }

    /**
     * Menyatukan request filters dengan default filters dari FilterColumn.
     * Setiap FilterColumn dipastikan punya state.
     */
    protected function mergeWithDefaultFilters(array $filters): array
    {
        $merged = [];

        foreach ($this->getFilterColumns() as $column) {
            $attribute = $column->getName();

            if (isset($filters[$attribute])) {
                $merged[$attribute] = $filters[$attribute];
            } else {
                if ($column->hasDefaultValue()) {
                    $merged[$attribute] = [
                        'enabled' => true,
                        'value' => $column->getDefault(),
                        'clause' => $column->getDefaultClause(),
                    ];
                } else {
                    $merged[$attribute] = [
                        'enabled' => false,
                        'value' => null,
                        'clause' => $column->getDefaultClause(),
                    ];
                }
            }
        }

        return $merged;
    }

    /**
     * Validasi nilai filter: null valid untuk op tertentu (ditangani belakangan).
     */
    protected function isValueValid($value): bool
    {
        if ($value === null) {
            return true;
        }
        if ($value === '') {
            return false;
        }
        if (is_array($value)) {
            return count(array_filter($value, fn ($v) => $v !== null && $v !== '')) > 0;
        }

        return true;
    }

    /**
     * Ambil default clause dari FilterColumn (fallback ke equals).
     */
    protected function getDefaultClause(string $attribute): string
    {
        $column = $this->getFilterColumn($attribute);

        return $column ? $column->getDefaultClause() : AdvanceOperator::EQUALS->value;
    }

    /**
     * Getter state (lazy-init jika kosong).
     */
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

    /** Setter state */
    public function setState(string $key, mixed $value): void
    {
        $this->state[$key] = $value;
    }

    /** Snapshot state lengkap untuk FE */
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

    /** Parser sort CSV → array */
    private static function parseSort(string $sort): array
    {
        return array_filter(explode(',', $sort));
    }

    /** Kontrak: disediakan Table turunan */
    abstract protected function defaultSort(): array;

    /** Kontrak: disediakan Table turunan */
    abstract protected function pagination(): array;
}
