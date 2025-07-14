<?php

namespace App\Policies;

use App\Models\AssetCategory;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class AssetCategoryPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('asset_category.viewAny');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, AssetCategory $assetCategory): bool
    {
        return $user->can('asset_category.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('asset_category.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, AssetCategory $assetCategory): bool
    {
        return $user->can('asset_category.update');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, AssetCategory $assetCategory): bool
    {
        return $user->can('asset_category.delete');
    }
}
