<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Manufacture extends Model
{
    use HasFactory;
    use HasUuids;

    protected $fillable = [
        'name',
        'address',
        'phone',
        'email',
        'website',
        'contact_person_name',
        'contact_person_phone',
        'contact_person_email',
    ];

    public function assets()
    {
        return $this->hasMany(Asset::class, 'manufacture_id');
    }
}
