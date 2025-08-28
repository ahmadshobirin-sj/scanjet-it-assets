<?php

// app/Http/Resources/MediaItemResource.php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \Spatie\MediaLibrary\MediaCollections\Models\Media */
class MediaItemResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'file_name' => $this->file_name,
            'model_id' => $this->model_id,
            'model_type' => $this->model_type,
            'mime_type' => $this->mime_type,
            'size' => $this->size,
            'human_readable_size' => $this->human_readable_size,
            'url' => $this->getUrl(),
            'thumb_url' => $this->hasGeneratedConversion('thumb') ? $this->getUrl('thumb') : null,
            'collection' => $this->collection_name,
            'custom_properties' => $this->custom_properties,
            'created_at' => optional($this->created_at)->toIso8601String(),
        ];
    }
}
