<?php

namespace App\Policies;

use App\Models\AssetAssignment;
use App\Models\User;

class AssetAssignmentPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('asset_assignment.viewAny');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user): bool
    {
        return $user->can('asset_assignment.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('asset_assignment.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, AssetAssignment $assetAssignment): bool
    {
        return $user->can('asset_assignment.update');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, AssetAssignment $assetAssignment): bool
    {
        return $user->can('asset_assignment.delete');
    }

    public function exportPdf(User $user): bool
    {
        return $user->can('asset_assignment.exportPdf');
    }
}
