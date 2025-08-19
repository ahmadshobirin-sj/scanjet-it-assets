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
        'assigned_at',
        'returned_at',
        'confirmed_at',
        'reference_code',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'returned_at' => 'datetime',
        'confirmed_at' => 'datetime',
    ];

    public function assets()
    {
        return $this->belongsToMany(Asset::class, 'asset_assignment_has_assets', 'asset_assignment_id', 'asset_id')
            ->using(AssetAssignmentItem::class)
            ->withPivot(['asset_return_id', 'condition', 'returned_at', 'created_at', 'updated_at'])
            ->withTimestamps();
    }

    // aset-aset yang masih dipinjam pada assignment ini
    public function assigned_assets()
    {
        return $this->assets()->wherePivotNull('returned_at');
    }

    public function assigned_user()
    {
        return $this->belongsTo(ExternalUser::class, 'assigned_user_id');
    }

    public function assigned_by()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function is_fully_returned(): bool
    {
        return ! $this->assets()->wherePivotNull('returned_at')->exists();
    }

    // header form pengembalian (1 assignment → banyak return form)
    public function returns()
    {
        return $this->hasMany(AssetReturn::class, 'asset_assignment_id');
    }
}
