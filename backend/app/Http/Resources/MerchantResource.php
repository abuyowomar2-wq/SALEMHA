<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MerchantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'store_name' => $this->store_name,
            'store_slug' => $this->store_slug,
            'logo_url' => $this->logo_url,
            'primary_color' => $this->primary_color,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
        ];
    }
}
