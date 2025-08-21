<?php

namespace App\Tables\Columns;

use App\Tables\Sorts\AllowedSort;
use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;
use Spatie\QueryBuilder\Filters\Filter;
use Spatie\QueryBuilder\Sorts\Sort;

/**
 * Column
 * ------
 * Deskriptor kolom untuk Table:
 * - label/sortable/toggleable/globalSearchable/hidden
 * - dukungan count columns (withCount)
 * - opsi "searchableCount" → supaya alias count bisa turut dicari di global search (HAVING)
 */
class Column
{
    private string $name;

    private ?string $label = null;

    private bool $sortable = false;

    private ?string $sortType = null;         // 'field' | 'custom'

    private Closure|Sort|null $customSort = null;

    private ?string $filterType = null;

    private Closure|Filter|null $customFilter = null;

    private bool $globalSearchable = false;

    private bool $toggleable = false;

    private bool $hidden = false;

    // Count properties
    private bool $isCountColumn = false;

    private ?string $countRelation = null;

    private ?string $countColumn = null;

    private ?array $countConditions = null;

    private bool $countDistinct = false;

    private bool $searchableCount = false; // agar alias count ikut di global search HAVING

    public function __construct(string $name)
    {
        $this->name = $name;
    }

    /** Factory */
    public static function make(string $name): static
    {
        return new static($name);
    }

    // -------- Count Helpers --------

    /**
     * Column::count('posts')
     * Column::count('posts', 'id')
     * Column::count('posts', 'id', ['status' => 'published'])
     */
    public static function count(string $relation, ?string $column = null, ?array $conditions = null): static
    {
        $instance = new static($relation.'_count');
        $instance->isCountColumn = true;
        $instance->countRelation = $relation;
        $instance->countColumn = $column;
        $instance->countConditions = $conditions;
        $instance->label = Str::headline($relation).' Count';

        return $instance;
    }

    /** Distinct count pada kolom relasi */
    public static function countDistinct(string $relation, string $column, ?array $conditions = null): static
    {
        $instance = static::count($relation, $column, $conditions);
        $instance->countDistinct = true;
        $instance->label = Str::headline($relation).' Unique Count';

        return $instance;
    }

    /** Alias count (withCount) ikut searchable di global search (HAVING) */
    public function searchableCount(bool $searchable = true): self
    {
        if ($this->isCountColumn) {
            $this->searchableCount = $searchable;
        }

        return $this;
    }

    public function isSearchableCount(): bool
    {
        return $this->searchableCount && $this->isCountColumn;
    }

    /** Jadikan count column sortable (akan pakai AllowedSort::field alias) */
    public function sortableCount(): self
    {
        if (! $this->isCountColumn) {
            throw new \InvalidArgumentException('sortableCount() can only be used on count columns');
        }

        $this->sortable = true;
        $this->sortType = 'field';

        return $this;
    }

    /** Tambah kondisi untuk count relasi */
    public function where(array $conditions): self
    {
        $this->countConditions = $conditions;

        return $this;
    }

    /** Set distinct count */
    public function distinct(bool $distinct = true): self
    {
        $this->countDistinct = $distinct;

        return $this;
    }

    public function isCountColumn(): bool
    {
        return $this->isCountColumn;
    }

    public function getCountConfig(): array
    {
        return [
            'relation' => $this->countRelation,
            'column' => $this->countColumn,
            'conditions' => $this->countConditions,
            'distinct' => $this->countDistinct,
        ];
    }

    /**
     * Build config untuk count apabila ingin dipakai manual;
     * saat ini withCount ditangani di Table::makeQuery()
     */
    public function buildCountQuery(): array
    {
        if (! $this->isCountColumn) {
            return [];
        }

        $countAs = $this->name;

        // default: gunakan withCount di Table
        if ($this->countRelation !== 'self') {
            return [
                'method' => 'withCount',
                'args' => [$this->countRelation.' as '.$countAs],
            ];
        }

        // count pada diri sendiri (jarang dipakai)
        return [
            'method' => 'selectRaw',
            'args' => ['COUNT('.($this->countColumn ?? '*').") as {$countAs}"],
        ];
    }

    // -------- Getters --------

    public function __toString(): string
    {
        return $this->name;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getLabel(): ?string
    {
        return $this->label;
    }

    public function isSortable(): bool
    {
        return $this->sortable;
    }

    public function getSortType(): ?string
    {
        return $this->sortType;
    }

    public function getCustomSort(): Closure|Sort
    {
        return $this->customSort;
    }

    public function getFilterType(): ?string
    {
        return $this->filterType;
    }

    public function getCustomFilter(): Closure|Filter|null
    {
        return $this->customFilter;
    }

    public function isGlobalSearchable(): bool
    {
        return $this->globalSearchable;
    }

    public function isToggleable(): bool
    {
        return $this->toggleable;
    }

    public function isHidden(): bool
    {
        return $this->hidden;
    }

    // -------- Setters (fluent) --------

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function setLabel(?string $label): self
    {
        $this->label = $label;

        return $this;
    }

    public function setSortable(bool $sortable): self
    {
        $this->sortable = $sortable;

        return $this;
    }

    public function setSortType(?string $sortType): self
    {
        $this->sortType = $sortType;

        return $this;
    }

    public function setCustomSort(Closure|Sort|null $customSort): self
    {
        $this->customSort = $customSort;

        return $this;
    }

    public function setFilterType(?string $filterType): self
    {
        $this->filterType = $filterType;

        return $this;
    }

    public function setCustomFilter(Closure|Filter|null $customFilter): self
    {
        $this->customFilter = $customFilter;

        return $this;
    }

    public function setGlobalSearchable(bool $globalSearchable): self
    {
        $this->globalSearchable = $globalSearchable;

        return $this;
    }

    public function setToggleable(bool $toggleable): self
    {
        $this->toggleable = $toggleable;

        return $this;
    }

    public function setHidden(bool $hidden): self
    {
        $this->hidden = $hidden;

        return $this;
    }

    // -------- Fluent helpers --------

    public function label(string $label): self
    {
        return $this->setLabel($label);
    }

    /**
     * sortable
     * --------
     * - true/false → pakai sort field biasa
     * - 'custom' + setCustomSort(Sort|Closure) → pakai custom sort (mis. AdvancedSort)
     */
    public function sortable(bool|string $sortable = true, Closure|Sort|null $custom = null): self
    {
        if (is_bool($sortable)) {
            $this->setSortable($sortable);
            if ($sortable) {
                $this->setSortType('field');
            }
        } else {
            $this->setSortable(true);
            $this->setSortType($sortable);
        }

        if ($custom !== null) {
            $this->setCustomSort($custom);
        }

        return $this;
    }

    public function globallySearchable(bool $globalSearchable = true): self
    {
        return $this->setGlobalSearchable($globalSearchable);
    }

    public function toggleable(bool $toggleable = true): self
    {
        return $this->setToggleable($toggleable);
    }

    public function hidden(bool $hidden = true): self
    {
        return $this->setHidden($hidden);
    }

    // -------- Sort wiring ke Spatie --------

    /**
     * getAllowedSort
     * --------------
     * - Field sort (default)
     * - Custom sort:
     *     - callback: AllowedSort::callback
     *     - Sort object: AllowedSort::custom (mis. AdvancedSort)
     *
     * Catatan: wiring AdvancedSort berbasis nested/pivot akan diaktifkan
     * lewat trait HasSortable (batch berikutnya), supaya bisa menyuntikkan
     * connectionHints dari Table.
     */
    public function getAllowedSort(): AllowedSort
    {
        if (! $this->isSortable()) {
            throw new \InvalidArgumentException("Column {$this->name} is not sortable.");
        }

        if ($this->isCountColumn) {
            // Count alias di-ORDER langsung sebagai field
            return AllowedSort::callback($this->name, function (Builder $query, bool $descending, string $property) {
                $direction = $descending ? 'desc' : 'asc';

                return $query->orderBy($this->name, $direction);
            });
        }

        return match ($this->sortType) {
            'field' => AllowedSort::field($this->name),
            'custom' => $this->customSort
                ? AllowedSort::custom($this->name, $this->customSort)
                : throw new \InvalidArgumentException('Custom sortType requires customSort closure or Sort.'),
            default => AllowedSort::field($this->name),
        };
    }

    // -------- FE schema --------

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'label' => $this->label,
            'sortable' => $this->sortable,
            'sortType' => $this->sortType,
            'filterType' => $this->filterType,
            'globalSearchable' => $this->globalSearchable,
            'toggleable' => $this->toggleable,
            'isCountColumn' => $this->isCountColumn,
            'countConfig' => $this->isCountColumn ? $this->getCountConfig() : null,
        ];
    }

    public function toSchema(): array
    {
        return [
            'id' => $this->name,
            'accessorKey' => $this->name,
            'header' => $this->label ?? Str::headline(implode(' ', explode('.', $this->name))),
            'enableSorting' => $this->sortable,
            'enableGlobalFilter' => $this->globalSearchable,
            'enableHiding' => $this->toggleable,
            'isCountColumn' => $this->isCountColumn,
        ];
    }
}
