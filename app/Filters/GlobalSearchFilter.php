<?php

namespace App\Filters;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Schema;
use Spatie\QueryBuilder\Filters\Filter;

class GlobalSearchFilter implements Filter
{
    protected array $ignored;

    public function __construct(array $ignored = [])
    {
        $this->ignored = $ignored;
    }

    public function __invoke(Builder $query, $value, string $property): Builder
    {
        if (empty($value)) {
            return $query;
        }

        $model = $query->getModel();
        $table = $model->getTable();
        $columns = Schema::getColumnListing($table);
        $searchable = array_filter($columns, function ($column) use ($table) {
            $type = Schema::getColumnType($table, $column);

            return in_array($type, ['string', 'text', 'varchar']);
        });

        $searchable = array_diff($searchable, $this->ignored);

        $searchValue = addslashes($value); // Basic sanitization

        return $query->where(function ($query) use ($searchValue, $searchable) {
            foreach ($searchable as $column) {
                $query->orWhere($column, 'LIKE', "%{$searchValue}%");
            }
        });
    }
}
