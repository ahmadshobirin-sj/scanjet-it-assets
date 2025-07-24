<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExternalUser extends Model
{
    protected $connection = 'mysql_crm';

    protected $table = 'users';

    protected $keyType = 'string';

    public function assetAssignments()
    {
        return $this->hasMany(AssetAssignment::class, 'assigned_user_id');
    }

    public function currentAssetAssignments()
    {
        return $this->hasMany(AssetAssignment::class, 'assigned_user_id')
            ->where('status', 'assigned');
    }

    public function assets()
    {
        return $this->hasManyThrough(
            Asset::class,
            AssetAssignment::class,
            'assigned_user_id',
            'id',
            'id',
            'asset_id'
        )->where('asset_assignments.status', 'assigned');
    }
}
