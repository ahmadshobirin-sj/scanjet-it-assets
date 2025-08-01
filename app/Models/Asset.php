<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Asset extends Model
{
    use HasFactory;
    use HasUuids;

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
        'last_maintenance' => 'date',
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
        return $this->belongsToMany(AssetAssignment::class, 'asset_assignment_has_assets', 'asset_id', 'asset_assignment_id');
    }

    public function currentAssignment()
    {
        return $this->assignments()
            ->where('status', 'assigned')
            ->orderBy('assigned_at', 'desc')
            ->first();
    }
}
