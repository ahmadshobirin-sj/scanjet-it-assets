<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetReturn extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'asset_returns';

    protected $keyType = 'string';

    protected $fillable = [
        'asset_assignment_id',
        'received_by_user_id',
        'returned_at',
        'notes',
    ];

    protected $casts = [
        'returned_at' => 'datetime',
    ];

    public function assignment()
    {
        return $this->belongsTo(AssetAssignment::class, 'asset_assignment_id');
    }

    public function received_by()
    {
        return $this->belongsTo(User::class, 'received_by_user_id');
    }

    // aset yang dikembalikan di form ini (melalui pivot)
    public function assets()
    {
        return $this->belongsToMany(Asset::class, 'asset_assignment_has_assets', 'asset_return_id', 'asset_id')
            ->using(AssetAssignmentItem::class)
            ->withPivot(['asset_assignment_id', 'condition', 'returned_at', 'created_at', 'updated_at'])
            ->withTimestamps();
    }
}
