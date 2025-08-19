<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Asset extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'category_id',
        'manufacture_id',
        'location',
        'serial_number',
        'asset_tag',
        'warranty_expired',
        'purchase_date',
        'note',
        'reference_link',
        'status',
    ];

    protected $casts = [
        'warranty_expired' => 'date',
        'purchase_date' => 'date',
        'last_maintenance' => 'datetime',
    ];

    public function category()
    {
        return $this->belongsTo(AssetCategory::class, 'category_id');
    }

    public function manufacture()
    {
        return $this->belongsTo(Manufacture::class, 'manufacture_id');
    }

    public function assignments()
    {
        return $this->belongsToMany(AssetAssignment::class, 'asset_assignment_has_assets', 'asset_id', 'asset_assignment_id')
            ->using(AssetAssignmentItem::class)
            ->withPivot(['asset_return_id', 'condition', 'returned_at', 'created_at', 'updated_at'])
            ->withTimestamps();
    }

    // assignment aktif untuk aset ini (belum dikembalikan)
    public function current_assignment()
    {
        return $this->assignments()
            ->wherePivotNull('returned_at')
            ->orderBy('asset_assignments.assigned_at', 'desc')
            ->first();
    }

    // semua return form yang pernah mengembalikan aset ini
    public function returns()
    {
        return $this->belongsToMany(AssetReturn::class, 'asset_assignment_has_assets', 'asset_id', 'asset_return_id')
            ->withPivot(['asset_assignment_id', 'condition', 'returned_at', 'created_at', 'updated_at'])
            ->withTimestamps();
    }
}
