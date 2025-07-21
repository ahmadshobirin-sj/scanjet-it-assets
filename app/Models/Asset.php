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
        'model',
        'location',
        'serial_number',
        'asset_tag',
        'warranty_expired',
        'purchase_date',
        'note',
        'reference_link',
        'assigned_user_id',
        'assigned_at',
        'status',
    ];

    protected $casts = [
        'warranty_expired' => 'date',
        'purchase_date' => 'date',
        'assigned_at' => 'datetime',
    ];

    public function category()
    {
        return $this->belongsTo(AssetCategory::class, 'category_id');
    }

    public function manufacture()
    {
        return $this->belongsTo(Manufacture::class, 'manufacture_id');
    }

    public function assignedUser()
    {
        return $this->belongsTo(ExternalUser::class, 'assigned_user_id');
    }
}
