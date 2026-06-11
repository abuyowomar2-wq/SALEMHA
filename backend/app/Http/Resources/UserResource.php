<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $this->role,
            'is_active' => $this->is_active,
            'merchant' => $this->whenLoaded('merchant', fn () => [
                'id' => $this->merchant->id,
                'store_name' => $this->merchant->store_name,
                'store_slug' => $this->merchant->store_slug,
                'logo_url' => $this->merchant->logo_url,
                'primary_color' => $this->merchant->primary_color,
            ]),
            'created_at' => $this->created_at,
        ];
    }
}
