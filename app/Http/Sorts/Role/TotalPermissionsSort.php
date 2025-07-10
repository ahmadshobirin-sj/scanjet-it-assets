<?php

namespace App\Http\Sorts\Role;

use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\Sorts\Sort;

class TotalPermissionsSort implements Sort
{
    public function __invoke(Builder $query, bool $descending, string $property)
    {
        $query->withCount('permissions')->orderBy('permissions_count', $descending ? 'desc' : 'asc');
    }
}
