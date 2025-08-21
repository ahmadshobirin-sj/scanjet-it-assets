<?php

namespace App\Tables\Traits;

use App\Tables\Enums\AdvanceOperator;
use App\Tables\FilterColumns\BooleanFilterColumn;
use App\Tables\FilterColumns\FilterColumn;
use App\Tables\FilterColumns\SelectFilterColumn;
use Illuminate\Support\Collection;

/**
 * HasFilter
 * ---------
 * - Mengelola daftar FilterColumn
 * - Build AllowedFilter untuk Spatie
 * - State default/aktif dari filter
 * - Ringkasan filter untuk FE
 *
 * Catatan:
 * - Kini trait ini juga “menyuntik” connection hints global dari Table
 *   (jika Table menyediakan method filterConnectionHints()) ke setiap FilterColumn
 *   yang belum punya hints sendiri.
 */
trait HasFilter
{
    protected ?Collection $filterColumns = null;

    /** Definisikan filter (wajib di-override di Table turunan) */
    abstract protected function filters(): array;

    /** Ambil koleksi FilterColumn (dibuat 1x) */
    public function getFilterColumns(): Collection
    {
        if ($this->filterColumns === null) {
            $this->filterColumns = collect($this->filters());
        }

        return $this->filterColumns;
    }

    /**
     * Menyuntik default connection hints dari Table ke semua FilterColumn
     * yang belum punya hints sendiri.
     */
    protected function applyDefaultConnectionHintsToFilterColumns(): void
    {
        if (! method_exists($this, 'filterConnectionHints')) {
            return;
        }

        $globalHints = $this->filterConnectionHints();
        if (empty($globalHints)) {
            return;
        }

        $this->filterColumns = $this->getFilterColumns()->map(function (FilterColumn $col) use ($globalHints) {
            $current = $col->getConnectionHints();
            if (empty($current)) {
                // Pasang global hints bila column belum punya hints
                $col->connectionHints($globalHints);
            }

            return $col;
        });
    }

    /** Konstruksi AllowedFilter untuk Spatie (dipakai Table::makeQuery) */
    public function filterResolver(): array
    {
        // Suntik connection hints global (sekali di awal)
        $this->applyDefaultConnectionHintsToFilterColumns();

        return $this->getFilterColumns()
            ->map(fn (FilterColumn $column) => $column->getAllowedFilter())
            ->values()
            ->toArray();
    }

    /** Peta filter → array schema untuk FE */
    public function getFiltersArray(): array
    {
        return $this->getFilterColumns()
            ->map(fn (FilterColumn $column) => $column->toArray())
            ->values()
            ->toArray();
    }

    /** Ambil FilterColumn by name */
    public function getFilterColumn(string $name): ?FilterColumn
    {
        return $this->getFilterColumns()
            ->first(fn (FilterColumn $column) => $column->getName() === $name);
    }

    /** Default state untuk semua filter (berdasarkan default value di column) */
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

    /** Ambil filter aktif dari state */
    public function getActiveFilters(): array
    {
        $state = $this->getState('filters', []);
        $active = [];

        foreach ($state as $attribute => $filter) {
            if ($filter['enabled'] ?? false) {
                $active[$attribute] = [
                    'op' => $filter['clause'],
                    'value' => $filter['value'],
                ];
            }
        }

        return $active;
    }

    /** Apakah ada filter aktif? */
    public function hasActiveFilters(): bool
    {
        $filters = $this->getState('filters', []);

        return collect($filters)->contains(fn ($f) => $f['enabled'] ?? false);
    }

    /** Reset semua filter ke default */
    public function clearFilters(): void
    {
        $this->setState('filters', $this->defaultFilters());
    }

    /** Terapkan filter ke satu attribute */
    public function applyFilter(string $attribute, mixed $value, ?string $clause = null): void
    {
        $filters = $this->getState('filters', []);
        $column = $this->getFilterColumn($attribute);

        if (! $column) {
            return;
        }

        // Validasi clause bila diberikan
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

    /** Hapus filter pada attribute */
    public function removeFilter(string $attribute): void
    {
        $filters = $this->getState('filters', []);
        if (isset($filters[$attribute])) {
            $filters[$attribute]['enabled'] = false;
            $filters[$attribute]['value'] = null;
        }
        $this->setState('filters', $filters);
    }

    /** Ringkasan filter untuk FE */
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

    /** Format nilai untuk ringkasan FE */
    protected function formatFilterValue(FilterColumn $column, mixed $value): string
    {
        if (is_array($value)) {
            return implode(' - ', $value);
        }

        if ($column instanceof SelectFilterColumn) {
            $options = $column->getOptions();
            $option = collect($options)->firstWhere('value', $value);

            return $option['label'] ?? (string) $value;
        }

        if ($column instanceof BooleanFilterColumn) {
            return $value ? 'Yes' : 'No';
        }

        return (string) $value;
    }

    /** Ambil label operator untuk ringkasan FE */
    protected function getClauseLabel(string $clause): string
    {
        try {
            $operator = AdvanceOperator::from($clause);

            return strtolower($operator->label());
        } catch (\ValueError $e) {
            return str_replace('_', ' ', $clause);
        }
    }

    /**
     * Validasi clause untuk sebuah column.
     * Perbaikan: clauses disimpan sebagai array of ['label','value'], jadi
     * kita bandingkan ke daftar value-nya.
     */
    public function isValidClause(string $attribute, string $clause): bool
    {
        $column = $this->getFilterColumn($attribute);
        if (! $column) {
            return false;
        }

        $values = array_map(
            fn ($c) => is_array($c) ? ($c['value'] ?? null) : $c,
            $column->getClauses()
        );

        return in_array($clause, array_filter($values), true);
    }

    /** Ambil daftar operator tersedia (untuk FE) */
    public function getAvailableOperators(string $attribute): array
    {
        $column = $this->getFilterColumn($attribute);
        if (! $column) {
            return [];
        }

        $ops = [];
        foreach ($column->getClauses() as $clause) {
            $val = is_array($clause) ? ($clause['value'] ?? null) : $clause;
            if (! $val) {
                continue;
            }
            try {
                $operator = AdvanceOperator::from($val);
                $ops[] = ['value' => $operator->value, 'label' => $operator->label()];
            } catch (\ValueError $e) {
                $ops[] = ['value' => $val, 'label' => $this->getClauseLabel($val)];
            }
        }

        return $ops;
    }

    /** Terapkan banyak filter sekaligus */
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

    /** Serialize aktif filter → query params */
    public function getFiltersAsQueryParams(): array
    {
        $params = [];
        foreach ($this->getActiveFilters() as $attribute => $filter) {
            $params["filter[{$attribute}][op]"] = $filter['op'];
            $params["filter[{$attribute}][value]"] = $filter['value'];
        }

        return $params;
    }

    /** Cek sebuah filter aktif */
    public function isFilterActive(string $attribute): bool
    {
        $filters = $this->getState('filters', []);

        return $filters[$attribute]['enabled'] ?? false;
    }

    /** Ambil nilai filter untuk attribute */
    public function getFilterValue(string $attribute): mixed
    {
        $filters = $this->getState('filters', []);

        return $filters[$attribute]['value'] ?? null;
    }

    /** Ambil clause filter untuk attribute */
    public function getFilterClause(string $attribute): ?string
    {
        $filters = $this->getState('filters', []);

        return $filters[$attribute]['clause'] ?? null;
    }

    /** Hitung jumlah filter aktif */
    public function countActiveFilters(): int
    {
        $filters = $this->getState('filters', []);

        return collect($filters)->filter(fn ($f) => $f['enabled'] ?? false)->count();
    }

    /** Toggle on/off sebuah filter */
    public function toggleFilter(string $attribute): void
    {
        $filters = $this->getState('filters', []);
        if (isset($filters[$attribute])) {
            $filters[$attribute]['enabled'] = ! ($filters[$attribute]['enabled'] ?? false);
            $this->setState('filters', $filters);
        }
    }
}
