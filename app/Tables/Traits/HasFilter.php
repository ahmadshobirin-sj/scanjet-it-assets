<?php

namespace App\Tables\Traits;

use App\Tables\Columns\Column;
use Illuminate\Support\Facades\DB;
use Spatie\QueryBuilder\AllowedFilter;

trait HasFilter
{
    /**
     * Return filters and search filters for QueryBuilder.
     */
    /**
     * Return filters including global search filter.
     */
    public function filters(): array
    {
        $columns = collect($this->columns());

        $globalSearchableColumns = $columns
            ->filter(fn (Column $col) => $col->isGlobalSearchable())
            ->map(fn (Column $col) => $col->getName())
            ->values()
            ->all();

        $globalSearch = AllowedFilter::callback('search', function ($query, $value) use ($globalSearchableColumns) {
            static $processedColumns = null;

            if ($processedColumns === null) {
                $processedColumns = [
                    'direct' => [],
                    'relations' => [],
                ];

                foreach ($globalSearchableColumns as $column) {
                    if (strpos($column, '.') !== false) {
                        $parts = explode('.', $column);
                        $relationColumn = array_pop($parts);
                        $relationPath = implode('.', $parts);

                        if (! isset($processedColumns['relations'][$relationPath])) {
                            $processedColumns['relations'][$relationPath] = [];
                        }
                        $processedColumns['relations'][$relationPath][] = $relationColumn;
                    } else {
                        $processedColumns['direct'][] = $column;
                    }
                }
            }

            $query->where(function ($query) use ($value, $processedColumns) {
                // Search direct columns
                foreach ($processedColumns['direct'] as $column) {
                    $query->orWhere($column, 'like', "%{$value}%");
                }

                // Search relationship columns
                foreach ($processedColumns['relations'] as $relationPath => $columns) {
                    $query->orWhereHas($relationPath, function ($relationQuery) use ($columns, $value) {
                        $relationQuery->select(DB::raw('1')); // Minimal select untuk EXISTS

                        $relationQuery->where(function ($whereQuery) use ($columns, $value) {
                            foreach ($columns as $column) {
                                $whereQuery->orWhere($column, 'like', "%{$value}%");
                            }
                        });
                    });
                }
            });
        });

        $columnFilters = $columns
            ->filter(fn (Column $col) => $col->getFilterType() !== null)
            ->map(fn (Column $col) => $col->getAllowedFilter())
            ->values();

        return collect([$globalSearch])
            ->merge($columnFilters)
            ->toArray();
    }

    public function defaultFilters(): array
    {
        return [];
    }
}
