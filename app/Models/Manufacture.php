<?php

namespace App\Models;

use App\HasFormattedTimestamp;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Manufacture extends Model
{
    use HasFactory;
    use HasUuids;
    use HasFormattedTimestamp;

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
}
