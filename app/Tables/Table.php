<?php

namespace App\Tables;

use App\Tables\Columns\Column;
use App\Tables\FilterColumns\FilterColumn;
use App\Tables\Traits\HasFilter;
use App\Tables\Traits\HasGlobalSearch;
use App\Tables\Traits\HasSortable;
use App\Tables\Traits\HasToggleable;
use App\Tables\Traits\TableState;
use Spatie\QueryBuilder\QueryBuilder;

abstract class Table
{
    use HasFilter;
    use HasGlobalSearch;
    use HasSortable;
    use HasToggleable;
    use TableState;

    /**
     * Return array of Column instances.
     *
     * @return Column[]
     */
    abstract public function columns(): array;

    /**
     * Return array of Column instances.
     *
     * @return FilterColumn[]
     */
    public function filters(): array
    {
        return [];
    }

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

    public function customizeQuery(QueryBuilder $query): QueryBuilder
    {
        return $query;
    }

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

    public function mapFiltersToSchema(): array
    {
        return array_reduce($this->filters(), function ($carry, FilterColumn $filter) {
            $carry[] = $filter->toArray();

            return $carry;
        }, []);
    }

    public function toSchema(): array
    {
        return [
            'columns' => $this->mapColumnsToSchema(),
            'filters' => $this->mapFiltersToSchema(),
            'state' => $this->getState(),
        ];
    }
}
