<?php

namespace App\Http\Filters;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Spatie\QueryBuilder\Filters\Filter;

class GlobalSearchNew implements Filter
{
    protected array $processedColumns = [
        'direct' => [],
        'relations' => [],
    ];

    public function __construct(protected array $columns = [])
    {
        $this->prepareColumns();
    }

    protected function prepareColumns(): void
    {
        foreach ($this->columns as $column) {
            if (strpos($column, '.') !== false) {
                $parts = explode('.', $column);
                $relationColumn = array_pop($parts);
                $relationPath = implode('.', $parts);

                $this->processedColumns['relations'][$relationPath][] = $relationColumn;
            } else {
                $this->processedColumns['direct'][] = $column;
            }
        }
    }

    public function __invoke(Builder $query, $value, string $property): Builder
    {
        $query->where(function ($query) use ($value) {
            foreach ($this->processedColumns['direct'] as $column) {
                $query->orWhere($column, 'like', "%{$value}%");
            }

            foreach ($this->processedColumns['relations'] as $relationPath => $columns) {
                $query->orWhereHas($relationPath, function ($relationQuery) use ($columns, $value) {
                    $relationQuery->select(DB::raw('1'));

                    $relationQuery->where(function ($whereQuery) use ($columns, $value) {
                        foreach ($columns as $column) {
                            $whereQuery->orWhere($column, 'like', "%{$value}%");
                        }
                    });
                });
            }
        });

        return $query;
    }
}
