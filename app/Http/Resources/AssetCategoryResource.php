<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetCategoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            "created_at" => $this->created_at,
            "updated_at" => $this->updated_at,
            "f_created_at" => $this->f_created_at,
            "f_updated_at" => $this->f_updated_at,
        ];
    }
}
