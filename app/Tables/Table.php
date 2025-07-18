<?php

namespace App\Tables;

use App\Tables\Columns\Column;
use App\Tables\Traits\HasFilter;
use App\Tables\Traits\HasSortable;
use App\Tables\Traits\HasToggleable;
use App\Tables\Traits\TableState;
use Spatie\QueryBuilder\QueryBuilder;

abstract class Table
{
    use TableState;
    use HasFilter;
    use HasSortable;
    use HasToggleable;

    /**
     * Return array of Column instances.
     *
     * @return Column[]
     */
    abstract public function columns(): array;

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
        return array_map(function (Column $column) {
            return $column->toSchema();
        }, $this->columns());
    }

    public function toSchema(): array
    {
        return [
            'columns' => $this->mapColumnsToSchema(),
            'state' => $this->getState(),
        ];
    }
}
