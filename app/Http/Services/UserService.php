<?php

namespace App\Http\Services;

use App\Http\Filters\GlobalSearchFilter;
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
        $users = QueryBuilder::for(User::query())
            ->allowedFilters([
                AllowedFilter::custom('search', new GlobalSearchFilter(['password'])),
                AllowedFilter::partial('name'),
                AllowedFilter::partial('email'),
            ])
            ->with(['roles'])
            ->allowedSorts(['name', 'email', 'created_at'])
            ->defaultSort(['-created_at'])
            ->paginate($request->input('per_page', 10))
            ->appends($request->query());

        return $users;
    }

    public function attributes(): array
    {
        return Schema::getColumnListing((new User)->getTable());
    }

    public function create(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create(Arr::only($data, $this->attributes()));
            $user->assignRole(
                Arr::get($data, 'roles')
            );

            return $user;
        });
    }

    public function update(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            $user->update(Arr::only($data, $this->attributes()));

            $user->syncRoles(
                Arr::get($data, 'roles')
            );

            return $user;
        });
    }

    public function delete(User $user): void
    {
        DB::transaction(fn () => $user->delete());
    }

    public function updateOrCreate(array $data)
    {
        $user = User::updateOrCreate([
            'email' => $data['email'],
        ], $data);

        return $user;
    }
}
