<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AssetAssignment extends Model
{
    use HasUuids;

    protected $keyType = 'string';

    protected $fillable = [
        'asset_id',
        'assigned_user_id',
        'user_id',
        'note',
        'status',
        'condition',
        'assigned_at',
        'returned_at',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'returned_at' => 'datetime',
    ];

    public function asset()
    {
        return $this->belongsTo(Asset::class, 'asset_id');
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
