<?php

namespace App\Http\Controllers;

use App\DTOs\TableStateDTO;
use App\Enums\AppNotificationStatus;
use App\Http\Requests\User\StoreRequest;
use App\Http\Requests\User\UpdateRequest;
use App\Http\Resources\RoleResource;
use App\Http\Resources\UserResource;
use App\Http\Services\UserService;
use App\Http\Tables\UserTable;
use App\Models\Role;
use App\Models\User;
use App\Notifications\AppNotification;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
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

            Notification::send(
                Auth::user(),
                (
                    new AppNotification(
                        message: 'User created successfully.',
                    )
                )
                    ->status(AppNotificationStatus::SUCCESS)
                    ->afterCommit()
            );

            return to_route('user.index');
        } catch (\Throwable $e) {
            if (app()->isProduction()) {
                report($e);
            } else {
                throw $e;
            }
            return back();
        }
    }

    public function update(User $user, UpdateRequest $request)
    {
        $this->authorize('update', $user);

        try {
            $this->userService->update($user, $request->validated());

            Notification::send(
                Auth::user(),
                (
                    new AppNotification(
                        message: 'User updated successfully.',
                    )
                )
                    ->status(AppNotificationStatus::SUCCESS)
                    ->afterCommit()
            );

            return to_route('user.index');
        } catch (\Throwable $e) {
            if (app()->isProduction()) {
                report($e);
            } else {
                throw $e;
            }
            return back();
        }
    }

    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        try {
            $this->userService->delete($user);

            Notification::send(
                Auth::user(),
                (
                    new AppNotification(
                        message: 'User deleted successfully.',
                    )
                )
                    ->status(AppNotificationStatus::SUCCESS)
                    ->afterCommit()
            );

            return to_route('user.index');
        } catch (\Throwable $e) {
            return back();
        }
    }
}
