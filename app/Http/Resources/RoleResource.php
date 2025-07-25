<?php

namespace App\Http\Resources;

use App\Http\Resources\Permissions\PermissionResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
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
            'guard_name' => $this->guard_name,
            'permissions' => PermissionResource::collection($this->whenLoaded('permissions')),
            'total_permissions' => $this->when(isset($this->permissions_count), fn () => $this->permissions_count),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'f_created_at' => $this->f_created_at,
            'f_updated_at' => $this->f_updated_at,
        ];
    }
}
