<?php

namespace App\Tables\Columns;

use App\Tables\Sorts\AllowedSort;
use Closure;
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

    public function __construct(string $name)
    {
        $this->name = $name;
    }

    public static function make(string $name): static
    {
        return new static($name);
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

        return match ($this->sortType) {
            'field' => AllowedSort::field($this->name),
            'custom' => $this->customSort
                ? AllowedSort::custom($this->name, $this->customSort)
                : throw new \InvalidArgumentException('Custom sortType requires customSort closure.'),
            default => throw new \InvalidArgumentException("Unknown sortType: {$this->sortType}")
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
        ];
    }
}
