<?php

namespace App\Http\Resources\Asset;

use App\Http\Resources\AssetCategoryResource;
use App\Http\Resources\ManufactureResource;
use App\Http\Resources\MediaItemResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetResource extends JsonResource
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
            'serial_number' => $this->serial_number,
            'location' => $this->location,
            'serial_number' => $this->serial_number,
            'warranty_expired' => $this->warranty_expired,
            'purchase_date' => $this->purchase_date,
            'note' => $this->note,
            'reference_link' => $this->reference_link,
            'category' => new AssetCategoryResource($this->whenLoaded('category')),
            'manufacture' => new ManufactureResource($this->whenLoaded('manufacture')),
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            // === PO Attachments (role pivot: 'po_attachment')
            'po_attachments' => $this->whenLoaded('poAttachmentLibraries', function () {
                // flatten media dari tiap MediaLibrary yang sudah di-eager load
                $media = $this->poAttachmentLibraries->flatMap->media->values();

                return MediaItemResource::collection($media);
            }),
        ];
    }
}
