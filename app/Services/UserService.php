<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Filters\GlobalSearchFilter;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class UserService
{
    public function getAll(Request $request)
    {
        return QueryBuilder::for(User::class)
            ->allowedFilters([
                AllowedFilter::custom('search', new GlobalSearchFilter(['password'])),
                AllowedFilter::partial('name'),
                AllowedFilter::partial('email'),
            ])
            ->allowedSorts(['name', 'email', 'created_at'])
            ->allowedFields(['name'])
            ->defaultSort(['-created_at'])
            ->paginate($request->input('per_page', 10))
            ->appends($request->query());
    }

    public function attributes(): array
    {
        return Schema::getColumnListing((new User)->getTable());
    }

    public function create(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create(Arr::only($data, $this->attributes()));
            $user->assignRole(UserRole::INACTIVE);

            return $user;
        });
    }

    public function update(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            $user->update(Arr::only($data, $this->attributes()));

            return $user;
        });
    }

    public function delete(User $user): void
    {
        DB::transaction(fn () => $user->delete());
    }
}
