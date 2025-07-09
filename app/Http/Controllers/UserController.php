<?php

namespace App\Http\Controllers;

use App\DTOs\TableStateDTO;
use App\Http\Requests\User\StoreRequest;
use App\Http\Requests\User\UpdateRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
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

        $tableState = TableStateDTO::fromRequest($request);

        return Inertia::render('user/list', [
            'user' => UserResource::collection($this->userService->getAll($request)),
            'table' => $tableState->toArray(),
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

            return to_route('user.index')
                ->with('success', [
                    'message' => 'User created successfully.',
                ]);
        } catch (\Throwable $e) {

            return back()
                ->withErrors(['message' => 'Failed to create user.', 'error' => $e->getMessage()]);
        }
    }

    public function update(User $user, UpdateRequest $request)
    {
        $this->authorize('update', $user);

        try {
            $this->userService->update($user, $request->validated());

            return to_route('user.index')->with('success', ['message' => 'User updated successfully.']);
        } catch (\Throwable $e) {
            return back()->withErrors(['message' => 'Failed to update user.', 'error' => $e->getMessage()]);
        }
    }

    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        try {
            $this->userService->delete($user);

            return to_route('user.index')->with('success', ['message' => 'User deleted successfully.']);
        } catch (\Throwable $e) {
            return back()->withErrors(['message' => 'Failed to delete user.', 'error' => $e->getMessage()]);
        }
    }
}
