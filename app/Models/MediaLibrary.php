<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class MediaLibrary extends Model implements HasMedia
{
    use HasUuids, InteractsWithMedia;

    public $incrementing = false;

    protected $keyType = 'string';

    // Alias ke relasi media milik Spatie
    public function spatieMedia()
    {
        return $this->media();
    }
}
