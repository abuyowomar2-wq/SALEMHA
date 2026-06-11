<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'status' => $this->status,
            'order_id' => $this->order_id,
            'used_at' => $this->used_at,
            'created_at' => $this->created_at,
        ];
    }
}
