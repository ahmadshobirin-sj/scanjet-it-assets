<?php

namespace App\Models;

use App\Models\Concerns\HasMediaLibrary;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Asset extends Model implements HasMedia
{
    use HasFactory, HasMediaLibrary, HasUuids, InteractsWithMedia;

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

    // Relational
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

    public function current_assignment_item()
    {
        return $this->hasOne(AssetAssignmentItem::class, 'asset_id', 'id')
            ->whereNull('returned_at')
            ->orderByDesc('created_at'); // atau join ke assigned_at kalau perlu
    }

    public function current_assignment()
    {
        return $this->hasOneThrough(
            AssetAssignment::class,
            AssetAssignmentItem::class,
            'asset_id',                 // Foreign key pada pivot -> assets
            'id',                       // Foreign key pada assignments
            'id',                       // Local key assets
            'asset_assignment_id'       // Local key pada pivot yang mengarah ke assignments
        )->whereNull('asset_assignment_has_assets.returned_at')
            ->orderByDesc('asset_assignments.assigned_at');
    }

    // semua return form yang pernah mengembalikan aset ini
    public function returns()
    {
        return $this->belongsToMany(AssetReturn::class, 'asset_assignment_has_assets', 'asset_id', 'asset_return_id')
            ->withPivot(['asset_assignment_id', 'condition', 'returned_at', 'created_at', 'updated_at'])
            ->withTimestamps();
    }

    public function poAttachmentLibraries()
    {
        return $this->mediaLibraries()->wherePivot('collection_name', 'po');
    }
}
