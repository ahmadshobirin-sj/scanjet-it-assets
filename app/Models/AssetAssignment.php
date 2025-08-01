<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetAssignment extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';

    protected $fillable = [
        'assigned_user_id',
        'user_id',
        'notes',
        'status',
        'condition',
        'assigned_at',
        'returned_at',
        'reference_code',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'returned_at' => 'datetime',
        'confirmed_at' => 'datetime',
    ];

    public function assets()
    {
        return $this->belongsToMany(Asset::class, 'asset_assignment_has_assets', 'asset_assignment_id', 'asset_id');
    }

    public function assignedUser()
    {
        return $this->belongsTo(ExternalUser::class, 'assigned_user_id');
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
