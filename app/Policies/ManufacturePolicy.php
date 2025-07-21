<?php

namespace App\Policies;

use App\Models\Manufacture;
use App\Models\User;

class ManufacturePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('manufacture.viewAny');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Manufacture $manufacture): bool
    {
        return $user->can('manufacture.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('manufacture.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Manufacture $manufacture): bool
    {
        return $user->can('manufacture.update');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Manufacture $manufacture): bool
    {
        return $user->can('manufacture.delete');
    }
}
