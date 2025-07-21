<?php

namespace App\Http\Controllers;

use App\DTOs\TableStateDTO;
use App\Http\Requests\Role\RoleStoreRequest;
use App\Http\Requests\Role\RoleUpdateRequest;
use App\Http\Resources\Permissions\PermissionResource;
use App\Http\Resources\RoleResource;
use App\Http\Services\RoleService;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected RoleService $roleService) {}

    public function index(Request $request)
    {
        $this->authorize('viewAny', Role::class);

        $roles = RoleResource::collection(
            $this->roleService->getAll($request)
        );
        $tableState = TableStateDTO::fromRequest($request);
        $tableState->setSort(['-created_at']);

        return Inertia::render('role/list', [
            'roles' => $roles,
            'table' => $tableState->toArray(),
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

            return to_route('role.index')
                ->with('success', [
                    'message' => 'Role created successfully.',
                ]);
        } catch (\Throwable $e) {
            return back()
                ->withErrors(['message' => 'Failed to create user.', 'error' => $e->getMessage()]);
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

            return to_route('role.index')->with('success', [
                'message' => 'Role updated successfully.',
            ]);
        } catch (\Throwable $e) {
            return back()
                ->withErrors(['message' => 'Failed to update role.', 'error' => $e->getMessage()]);
        }
    }

    public function destroy(Role $role)
    {
        $this->authorize('delete', $role);

        try {
            $this->roleService->delete($role);

            return redirect()
                ->route('role.index')
                ->with('success', [
                    'message' => 'Role deleted successfully.',
                ]);
        } catch (\Throwable $e) {
            return back()
                ->withErrors(['message' => 'Failed to delete role.', 'error' => $e->getMessage()]);
        }
    }
}
