<?php

namespace App\Services;

use App\Filters\GlobalSearchFilter;
use App\Models\Role;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class RoleService
{
    public function getAll(Request $request)
    {
        return QueryBuilder::for(Role::class)
            ->allowedFilters([
                AllowedFilter::custom('search', new GlobalSearchFilter),
            ])
            ->allowedSorts(['name', 'email', 'created_at'])
            ->allowedFields(['name'])
            ->defaultSort(['-created_at'])
            ->paginate($request->input('per_page', 10))
            ->appends($request->query());
    }
}
