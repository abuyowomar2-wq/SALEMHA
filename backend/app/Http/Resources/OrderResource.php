<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'product_id' => $this->product_id,
            'product_name' => $this->whenLoaded('product', fn () => $this->product->name),
            'customer_name' => $this->customer_name,
            'customer_phone' => $this->customer_phone,
            'customer_email' => $this->customer_email,
            'status' => $this->status,
            'delivery_status' => $this->delivery_status,
            'notes' => $this->notes,
            'delivery_link' => $this->whenLoaded('deliveryLink', fn () => [
                'hash' => substr($this->deliveryLink->token_hash, 0, 16),
                'is_active' => $this->deliveryLink->is_active,
                'last_accessed_at' => $this->deliveryLink->last_accessed_at,
            ]),
            'created_at' => $this->created_at,
        ];
    }
}
