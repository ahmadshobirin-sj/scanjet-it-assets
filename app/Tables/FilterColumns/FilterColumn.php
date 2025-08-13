<?php

namespace App\Tables\FilterColumns;

use App\Helpers\ClosureHelper;
use App\Tables\Enums\AdvanceOperator;
use App\Tables\Supports\AdvancedFilter;
use Closure;
use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\Filters\Filter;

abstract class FilterColumn
{
    protected string|Closure $name;

    protected string|Closure|null $label = null;

    protected mixed $default = null;

    protected Filter|Closure|null $customFilter = null;

    protected array $clauses = [];

    protected string $defaultClause;

    protected bool $allowNested = false;

    protected bool $hasDefaultValue = false;

    public function __construct(string|Closure $name)
    {
        $this->name = $name;
        $this->setDefaultClauses();
    }

    abstract protected function setDefaultClauses(): void;

    public static function make(string|Closure $name): static
    {
        return new static($name);
    }

    // Getters
    public function getName(): string
    {
        return ClosureHelper::evaluate($this->name);
    }

    public function getLabel(): ?string
    {
        return ClosureHelper::evaluate($this->label) ?? $this->getName();
    }

    public function getDefault(): mixed
    {
        return ClosureHelper::evaluate($this->default);
    }

    public function getCustomFilter(): Filter|Closure|null
    {
        return ClosureHelper::evaluate($this->customFilter);
    }

    public function getClauses(): array
    {
        return $this->clauses;
    }

    public function getDefaultClause(): string
    {
        return $this->defaultClause;
    }

    public function isNested(): bool
    {
        return $this->allowNested;
    }

    public function hasDefaultValue(): bool
    {
        return $this->hasDefaultValue;
    }

    // Setters & fluent
    public function label(string|Closure $label): static
    {
        $this->label = $label;

        return $this;
    }

    public function default(mixed $value): static
    {
        $this->default = $value;
        $this->hasDefaultValue = true;

        return $this;
    }

    public function clauses(array $clauses): static
    {
        $this->clauses = $clauses;

        return $this;
    }

    public function defaultClause(string $clause): static
    {
        $this->defaultClause = $clause;

        return $this;
    }

    public function nested(bool $allow = true): static
    {
        $this->allowNested = $allow;

        return $this;
    }

    public function customFilter(Filter|Closure $filter): static
    {
        $this->customFilter = $filter;

        return $this;
    }

    abstract public function getType(): string;

    public function toArray(): array
    {
        return [
            'type' => $this->getType(),
            'attribute' => $this->getName(),
            'label' => $this->getLabel(),
            'clauses' => $this->getClauses(),
            'meta' => $this->getMeta(),
            'hasDefaultValue' => $this->hasDefaultValue(),
        ];
    }

    /**
     * Get metadata for this filter
     */
    protected function getMeta(): ?array
    {
        return null;
    }

    public function getAllowedFilter(): AllowedFilter
    {
        if ($this->customFilter instanceof Filter) {
            return AllowedFilter::custom($this->getName(), $this->getCustomFilter());
        }

        if ($this->customFilter instanceof Closure) {
            return AllowedFilter::custom($this->getName(), $this->getCustomFilter());
        }

        // Default to AdvancedFilter
        return AllowedFilter::custom($this->getName(), $this->createFilter());
    }

    /**
     * Create the filter instance for this column
     * Override in child classes for custom behavior
     */
    protected function createFilter(): Filter|Closure
    {
        // Default to AdvancedFilter for backward compatibility
        return new AdvancedFilter($this->getName());
    }

    /**
     * Apply filter logic (can be overridden in child classes)
     */
    protected function applyFilter(Builder $query, $value, string $property): Builder
    {
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

        return $this->applyOperator($query, $property, $operatorEnum, $filterValue);
    }

    /**
     * Apply the operator (override in child classes for custom logic)
     */
    protected function applyOperator(Builder $query, string $column, AdvanceOperator $operator, $value): Builder
    {
        // Default implementation - can be overridden
        return match ($operator) {
            AdvanceOperator::EQUALS => $query->where($column, '=', $value),
            AdvanceOperator::NOT_EQUALS => $query->where($column, '!=', $value),
            AdvanceOperator::IS_NULL => $query->whereNull($column),
            AdvanceOperator::IS_NOT_NULL => $query->whereNotNull($column),
            default => $query,
        };
    }
}
