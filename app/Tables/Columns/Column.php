<?php

namespace App\Tables\Columns;

use App\Tables\Sorts\AllowedSort;
use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;
use Spatie\QueryBuilder\Filters\Filter;
use Spatie\QueryBuilder\Sorts\Sort;

class Column
{
    private string $name;

    private ?string $label = null;

    private bool $sortable = false;

    private ?string $sortType = null;

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

    private bool $searchableCount = false;

    public function __construct(string $name)
    {
        $this->name = $name;
    }

    public static function make(string $name): static
    {
        return new static($name);
    }

    /**
     * Create a count column
     * Examples:
     * - Column::count('posts') // Count all posts
     * - Column::count('posts', 'id') // Count posts by id
     * - Column::count('posts', 'id', ['status' => 'published']) // Count published posts
     */
    public static function count(string $relation, ?string $column = null, ?array $conditions = null): static
    {
        $instance = new static($relation.'_count');
        $instance->isCountColumn = true;
        $instance->countRelation = $relation;
        $instance->countColumn = $column;
        $instance->countConditions = $conditions;

        // Set default label
        $instance->label = Str::headline($relation).' Count';

        return $instance;
    }

    /**
     * Create a distinct count column
     */
    public static function countDistinct(string $relation, string $column, ?array $conditions = null): static
    {
        $instance = static::count($relation, $column, $conditions);
        $instance->countDistinct = true;
        $instance->label = Str::headline($relation).' Unique Count';

        return $instance;
    }

    /**
     * Make count column searchable
     */
    /**
     * Make count column searchable in global search
     */
    public function searchableCount(bool $searchable = true): self
    {
        if ($this->isCountColumn) {
            $this->searchableCount = $searchable;
        }

        return $this;
    }

    /**
     * Check if count column is searchable
     */
    public function isSearchableCount(): bool
    {
        return $this->searchableCount && $this->isCountColumn;
    }

    /**
     * Make count column sortable
     */
    public function sortableCount(): self
    {
        if (! $this->isCountColumn) {
            throw new \InvalidArgumentException('sortableCount() can only be used on count columns');
        }

        $this->sortable = true;
        $this->sortType = 'field';

        return $this;
    }

    /**
     * Set count conditions
     */
    public function where(array $conditions): self
    {
        $this->countConditions = $conditions;

        return $this;
    }

    /**
     * Set distinct count
     */
    public function distinct(bool $distinct = true): self
    {
        $this->countDistinct = $distinct;

        return $this;
    }

    /**
     * Check if this is a count column
     */
    public function isCountColumn(): bool
    {
        return $this->isCountColumn;
    }

    /**
     * Get count configuration
     */
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
     * Build count query for Eloquent
     * This will be used in the table query builder
     */
    public function buildCountQuery(): array
    {
        if (! $this->isCountColumn) {
            return [];
        }

        $countAs = $this->name;

        // Build the count query configuration
        $query = [
            'method' => 'withCount',
            'args' => [],
        ];

        // Handle different count scenarios
        if ($this->countRelation === 'self') {
            // Count on the same table
            $query['method'] = 'selectRaw';

            if ($this->countDistinct && $this->countColumn) {
                $query['args'] = ["COUNT(DISTINCT {$this->countColumn}) as {$countAs}"];
            } else {
                $column = $this->countColumn ?? '*';
                $query['args'] = ["COUNT({$column}) as {$countAs}"];
            }
        } else {
            // Count on relation
            if ($this->countConditions || $this->countColumn || $this->countDistinct) {
                // Complex count with conditions
                $query['args'] = [
                    [
                        $this->countRelation => function ($query) {
                            if ($this->countConditions) {
                                foreach ($this->countConditions as $field => $value) {
                                    if (is_array($value)) {
                                        $query->whereIn($field, $value);
                                    } else {
                                        $query->where($field, $value);
                                    }
                                }
                            }

                            if ($this->countDistinct && $this->countColumn) {
                                $query->selectRaw("COUNT(DISTINCT {$this->countColumn})");
                            } elseif ($this->countColumn) {
                                $query->select($this->countColumn);
                            }
                        },
                    ],
                ];

                // Custom alias for the count
                $query['as'] = $countAs;
            } else {
                // Simple count
                $query['args'] = [$this->countRelation.' as '.$countAs];
            }
        }

        return $query;
    }

    public function __toString(): string
    {
        return $this->name;
    }

    // Getters
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

    public function getCustomSort(): ?Closure
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

    // Setters (Fluent Interface)
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

    // Fluent Interface Methods (Chainable)
    public function label(string $label): self
    {
        return $this->setLabel($label);
    }

    public function sortable(bool|string $sortable = true, Closure|Sort|null $custom = null): self
    {
        if (is_bool($sortable)) {
            $this->setSortable($sortable);
            if ($sortable) {
                $this->setSortType('field'); // Default sort type
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

    // Utility Methods
    public function getAllowedSort(): AllowedSort
    {
        if (! $this->isSortable()) {
            throw new \InvalidArgumentException("Column {$this->name} is not sortable.");
        }
        // Handle count columns dengan custom sort
        if ($this->isCountColumn) {
            // Count columns need custom sort without table prefix
            return AllowedSort::callback($this->name, function (Builder $query, bool $descending, string $property) {
                $direction = $descending ? 'desc' : 'asc';

                // Use alias directly without table prefix
                return $query->orderBy($this->name, $direction);
            });
        }

        return match ($this->sortType) {
            'field' => AllowedSort::field($this->name),
            'custom' => $this->customSort
                ? AllowedSort::custom($this->name, $this->customSort)
                : throw new \InvalidArgumentException('Custom sortType requires customSort closure.'),
            default => AllowedSort::field($this->name)
        };
    }

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
