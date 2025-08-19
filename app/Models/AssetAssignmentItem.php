<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class AssetAssignmentItem extends Pivot
{
    protected $table = 'asset_assignment_has_assets';

    public $incrementing = false; // PK komposit

    protected $keyType = 'string';

    public $timestamps = true;    // <— penting karena pivot pakai withTimestamps()

    protected $fillable = [
        'asset_id',
        'asset_assignment_id',
        'asset_return_id',
        'condition',
        'returned_at',
    ];

    protected $casts = [
        'returned_at' => 'datetime',
    ];

    public function asset()
    {
        return $this->belongsTo(Asset::class, 'asset_id');
    }

    public function assignment()
    {
        return $this->belongsTo(AssetAssignment::class, 'asset_assignment_id');
    }

    public function return_log()
    {
        return $this->belongsTo(AssetReturn::class, 'asset_return_id');
    }
}
