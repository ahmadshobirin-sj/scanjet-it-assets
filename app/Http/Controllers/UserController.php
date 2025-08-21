<?php

namespace App\Http\Controllers;

use App\Http\Requests\User\StoreRequest;
use App\Http\Requests\User\UpdateRequest;
use App\Http\Resources\RoleResource;
use App\Http\Services\UserService;
use App\Http\Tables\UserTable;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected UserService $userService) {}

    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        $users = [];
        $roles = [];

        try {
            $users = UserTable::make('users')->toSchema();
            $roles = RoleResource::collection(Role::all());
        } catch (\Throwable $th) {
            if (app()->isProduction()) {
                report($th);
            } else {
                throw $th;
            }
        }

        return Inertia::render('user/list', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    public function show(User $user)
    {
        $this->authorize('view', $user);
    }

    public function store(StoreRequest $request)
    {
        $this->authorize('create', User::class);

        try {
            $this->userService->create($request->validated());

            return to_route('user.index')->withSuccessFlash('User created successfully.');
        } catch (\Throwable $e) {
            if (app()->isProduction()) {
                report($e);
            } else {
                throw $e;
            }

            return back()->withErrorsFlash('Failed to created user. Please try again later.');
        }
    }

    public function update(User $user, UpdateRequest $request)
    {
        $this->authorize('update', $user);

        try {
            $this->userService->update($user, $request->validated());

            return to_route('user.index')->withSuccessFlash('User updated successfully.');
        } catch (\Throwable $e) {
            if (app()->isProduction()) {
                report($e);
            } else {
                throw $e;
            }

            return back()->withErrorsFlash('Failed to update user. Please try again later.');
        }
    }

    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        try {
            $this->userService->delete($user);

            return to_route('user.index')->withSuccessFlash('User deleted successfully.');
        } catch (\Throwable $e) {
            if (app()->isProduction()) {
                report($e);
            } else {
                throw $e;
            }

            return back()->withErrorsFlash('Failed to delete user. Please try again later.');
        }
    }
}
