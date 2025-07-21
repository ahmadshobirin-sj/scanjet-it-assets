<?php

namespace App\Http\Services;

use App\Http\Filters\GlobalSearchFilter;
use App\Http\Sorts\Role\TotalPermissionsSort;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;

class RoleService
{
    public function getAll(Request $request)
    {
        return QueryBuilder::for(Role::class)
            ->with(['permissions'])
            ->withCount('permissions')
            ->allowedFilters([
                AllowedFilter::custom('search', new GlobalSearchFilter),
            ])
            ->allowedSorts(['name', AllowedSort::custom('total_permissions', new TotalPermissionsSort), 'created_at'])
            ->defaultSort(['-created_at'])
            ->paginate($request->input('per_page', 10))
            ->appends($request->query());
    }

    public function getById(string $id): Role
    {
        $role = QueryBuilder::for(Role::class)
            ->with(['permissions'])
            ->withCount('permissions')
            ->findOrFail($id);

        return $role;
    }

    public function create(array $data): Role
    {
        return DB::transaction(function () use ($data) {
            $role = Role::create(Arr::only($data, $this->attributes()));

            $role->syncPermissions($data['permissions']);

            return $role;
        });
    }

    public function attributes(): array
    {
        return Schema::getColumnListing((new Role)->getTable());
    }

    public function update(Role $role, array $data): Role
    {
        return DB::transaction(function () use ($role, $data) {
            $role->update(Arr::only($data, $this->attributes()));

            $role->syncPermissions($data['permissions']);

            return $role;
        });
    }

    public function delete(Role $role): void
    {
        DB::transaction(function () use ($role) {
            $role->permissions()->detach();
            $role->delete();
        });
    }
}
