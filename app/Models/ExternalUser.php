<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class ExternalUser extends Model
{
    use Notifiable;

    protected $connection = 'mysql_crm';

    protected $table = 'users';

    protected $keyType = 'string';

    public function assetAssignments()
    {
        return $this->hasMany(AssetAssignment::class, 'assigned_user_id');
    }
}
