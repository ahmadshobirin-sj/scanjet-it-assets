<?php

namespace App\Http\Services;

use App\Http\Filters\GlobalSearchFilter;
use App\Http\Sorts\Role\TotalPermissionsSort;
use App\Models\Role;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;

class RoleService
{
    public function getAll(Request $request)
    {
        return QueryBuilder::for(Role::class)
            ->withCount('permissions')
            ->allowedFilters([
                AllowedFilter::custom('search', new GlobalSearchFilter()),
            ])
            ->allowedSorts(['name', AllowedSort::custom('total_permissions', new TotalPermissionsSort), 'created_at'])
            ->defaultSort(['name'])
            ->paginate($request->input('per_page', 10))
            ->appends($request->query());
    }
}
