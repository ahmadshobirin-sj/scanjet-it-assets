<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuthResource extends JsonResource
{
    public static $wrap = '';
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        if (empty($this->resource)) {
            return [];
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'roles' => $this->roles->map(function ($role) {
                return $role->name;
            }),
            'permissions' => $this->roles->flatMap(function ($role) {
                return $role->permissions->pluck('name');
            })->unique()->values(),
            'created_at' => $this->created_at,
        ];
    }
}
