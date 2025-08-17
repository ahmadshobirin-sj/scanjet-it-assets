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

    protected array $countColumns = [];

    public function __construct(
        protected array $columns = [],
        array $countColumns = [] // Terima count columns terpisah
    ) {
        $this->countColumns = $countColumns;
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
            // Search in direct columns
            foreach ($this->processedColumns['direct'] as $column) {
                $query->orWhere($column, 'like', "%{$value}%");
            }

            // Search in relations
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

        // Handle count columns separately with HAVING (after GROUP BY)
        if (! empty($this->countColumns) && is_numeric($value)) {
            $query->havingRaw(
                '('.implode(' OR ', array_map(function ($col) use ($value) {
                    return "{$col} = {$value}";
                }, $this->countColumns)).')'
            );
        }

        return $query;
    }
}
