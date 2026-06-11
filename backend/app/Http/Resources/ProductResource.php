<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'type' => $this->type,
            'instructions' => $this->instructions,
            'is_active' => $this->is_active,
            'inventory_count' => $this->whenCounted('inventoryItems'),
            'available_count' => $this->whenCounted('availableItems'),
            'created_at' => $this->created_at,
        ];
    }
}
