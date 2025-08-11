<?php

namespace App\Policies;

use App\Models\AssetReturn;
use App\Models\User;

class AssetReturnPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('asset_return.viewAny');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, AssetReturn $assetReturn): bool
    {
        return $user->can('asset_return.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('asset_return.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, AssetReturn $assetReturn): bool
    {
        return $user->can('asset_return.update');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, AssetReturn $assetReturn): bool
    {
        return $user->can('asset_return.delete');
    }
}
