<?php

namespace App\Tables\FilterColumns;

use App\Helpers\ClosureHelper;
use Closure;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\Filters\Filter;

abstract class FilterColumn
{
    protected string|Closure $name;

    protected string|Closure|null $label = null;

    protected mixed $default = null;

    protected Closure|Filter|null $customFilter = null;

    protected string|Closure $filterType = 'partial';

    public function __construct(string|Closure $name)
    {
        $this->name = $name;
    }

    public static function make(string|Closure $name): static
    {
        return new static($name);
    }

    // Common getters
    public function getName(): string
    {
        return ClosureHelper::evaluate($this->name);
    }

    public function getLabel(): ?string
    {
        return ClosureHelper::evaluate($this->label);
    }

    public function getDefault(): mixed
    {
        return ClosureHelper::evaluate($this->default);
    }

    public function getCustomFilter(): Closure|Filter|null
    {
        return ClosureHelper::evaluate($this->customFilter);
    }

    public function getFilterType(): string
    {
        return ClosureHelper::evaluate($this->filterType);
    }

    // Common setters & fluent
    public function label(string|Closure $label): static
    {
        $this->label = $label;

        return $this;
    }

    public function default(mixed $value): static
    {
        $this->default = $value;

        return $this;
    }

    public function customFilter(string $filterType, Closure|Filter|null $filter = null): static
    {
        $this->filterType = $filterType;
        $this->customFilter = $filter;

        return $this;
    }

    abstract public function getType(): string;

    abstract public function toArray(): array;

    public function getAllowedFilter(): AllowedFilter
    {
        return match ($this->getFilterType()) {
            'partial' => AllowedFilter::partial($this->getName()),
            'exact' => AllowedFilter::exact($this->getName()),
            'scope' => AllowedFilter::scope($this->getName()),
            'callback', 'custom' => $this->getCustomFilter()
                ? AllowedFilter::callback($this->getName(), $this->getCustomFilter())
                : throw new \InvalidArgumentException('Custom filterType requires customFilter.'),
            default => throw new \InvalidArgumentException("Unknown filterType: {$this->getFilterType()}")
        };
    }
}
