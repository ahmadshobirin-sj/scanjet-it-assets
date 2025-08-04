<?php

namespace App\Policies;

use App\Models\User;

class TelescopePolicy
{
    public function viewTelescope(User $user): bool
    {
        return $user->can('viewTelescope');
    }
}
