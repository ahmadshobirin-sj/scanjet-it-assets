<?php

namespace App\Models;

use App\HasFormattedTimestamp;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Permission\Models\Role as ModelsRole;

class Role extends ModelsRole
{
    use HasFactory;
    use HasFormattedTimestamp;
    use HasUuids;

    public function getColor(): string
    {
        return match ($this->name) {
            'Super Admin' => 'primary',
            'Admin' => 'success',
            'Inactive' => 'secondary',
            default => 'warning',
        };
    }
}
