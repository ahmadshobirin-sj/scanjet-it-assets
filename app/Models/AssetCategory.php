<?php

namespace App\Models;

use App\HasFormattedTimestamp;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetCategory extends Model
{
    use HasFactory;
    use HasUuids;
    use HasFormattedTimestamp;

    protected $fillable = [
        'id',
        'name',
        'description',
    ];

    public function assets()
    {
        return $this->hasMany(Asset::class, 'category_id');
    }
}
