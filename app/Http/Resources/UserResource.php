<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'email' => $this->email,
            'given_name' => $this->given_name,
            'surname' => $this->surname,
            'user_principal_name' => $this->user_principal_name,
            'business_phone' => $this->business_phone,
            'mobile_phone' => $this->mobile_phone,
            'job_title' => $this->job_title,
            'office_location' => $this->office_location,
            'roles' => RoleResource::collection($this->whenLoaded('roles')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'f_created_at' => $this->f_created_at,
            'f_updated_at' => $this->f_updated_at,
        ];
    }
}
