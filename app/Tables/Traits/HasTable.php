<?php

namespace App\Tables\Traits;

use App\Tables\Table;
use Spatie\QueryBuilder\QueryBuilder;

trait HasTable
{
    protected Table $table;

    public function buildTable($modelClass, Table $table): QueryBuilder
    {
        $this->table = $table;

        $filters = collect($table->globalSearchResolver())
            ->merge($table->filterResolver())
            ->filter(fn ($item) => filled($item))
            ->toArray();

        $query = QueryBuilder::for($modelClass)
            ->allowedFilters($filters)
            ->allowedSorts($table->sorts())
            ->defaultSort($table->defaultSort());

        if (! empty($table->with())) {
            $query->with($table->with());
        }

        if (! empty($table->toggleableColumns())) {
            $query->allowedFields($table->toggleableColumns());
        }

        return $table->customizeQuery($query);
    }

    public function executeTableQuery(QueryBuilder $query)
    {
        return $query->paginate(request('per_page', $this->table->pagination()['per_page']))
            ->appends(request()->query());
    }

    public function getTable(): Table
    {
        return $this->table;
    }
}
