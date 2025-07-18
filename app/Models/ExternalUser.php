<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ExternalUser extends Model
{
    protected $connection = 'mysql_crm';
    protected $table = 'users';
    protected $keyType = 'string';


    public function assets()
    {
        return $this->hasMany(Asset::class, 'assigned_user_id');
    }
}
