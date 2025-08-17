<?php

namespace App\Http\Controllers;

use App\Enums\AppNotificationStatus;
use App\Http\Requests\Role\RoleStoreRequest;
use App\Http\Requests\Role\RoleUpdateRequest;
use App\Http\Resources\Permissions\PermissionResource;
use App\Http\Resources\RoleResource;
use App\Http\Services\RoleService;
use App\Http\Tables\RoleTable;
use App\Models\Permission;
use App\Models\Role;
use App\Notifications\AppNotification;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;

class RoleController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected RoleService $roleService) {}

    public function index(Request $request)
    {
        $this->authorize('viewAny', Role::class);
        $roles = [];
        try {
            $roles = RoleTable::make('roles')->toSchema();
        } catch (\Throwable $th) {
            if (app()->isProduction()) {
                report($th);
            } else {
                throw $th;
            }
        }

        return Inertia::render('role/list', [
            'roles' => $roles,
        ]);
    }

    public function create()
    {
        $this->authorize('create', Role::class);

        $permissions = PermissionResource::collection(Permission::all());

        return Inertia::render('role/create', [
            'permissions' => $permissions,
        ]);
    }

    public function store(RoleStoreRequest $request)
    {
        $this->authorize('create', Role::class);

        try {
            $this->roleService->create($request->validated());

            Notification::send(
                Auth::user(),
                (
                    new AppNotification(
                        message: 'Role created successfully.',
                    )
                )
                    ->status(AppNotificationStatus::SUCCESS)
                    ->afterCommit()
            );

            return to_route('role.index');
        } catch (\Throwable $e) {
            if (app()->isProduction()) {
                report($e);
            } else {
                throw $e;
            }

            return back();
        }
    }

    public function show(Role $role)
    {
        $this->authorize('view', $role);

        $permissions = PermissionResource::collection(Permission::all());

        $role->load('permissions');

        return Inertia::render('role/detail', [
            'role' => new RoleResource($role),
            'permissions' => $permissions,
        ]);
    }

    public function edit(Role $role)
    {
        $this->authorize('update', $role);

        $permissions = PermissionResource::collection(Permission::all());

        $role->load('permissions');

        return Inertia::render('role/edit', [
            'role' => new RoleResource($role),
            'permissions' => $permissions,
        ]);
    }

    public function update(RoleUpdateRequest $request, Role $role)
    {
        $this->authorize('update', $role);

        try {
            $this->roleService->update($role, $request->validated());

            Notification::send(
                Auth::user(),
                (
                    new AppNotification(
                        message: 'Role updated successfully.',
                    )
                )
                    ->status(AppNotificationStatus::SUCCESS)
                    ->afterCommit()
            );

            return to_route('role.index');
        } catch (\Throwable $e) {
            if (app()->isProduction()) {
                report($e);
            } else {
                throw $e;
            }

            return back();
        }
    }

    public function destroy(Role $role)
    {
        $this->authorize('delete', $role);

        try {
            $this->roleService->delete($role);

            Notification::send(
                Auth::user(),
                (
                    new AppNotification(
                        message: 'Role deleted successfully.',
                    )
                )
                    ->status(AppNotificationStatus::SUCCESS)
                    ->afterCommit()
            );

            return redirect()
                ->route('role.index');
        } catch (\Throwable $e) {
            if (app()->isProduction()) {
                report($e);
            } else {
                throw $e;
            }

            return back();
        }
    }
}
