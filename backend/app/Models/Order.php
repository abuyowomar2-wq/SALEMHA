<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'merchant_id',
        'order_number',
        'product_id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'verification_code',
        'status',
        'delivery_status',
        'notes',
    ];

    public function merchant(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Merchant::class);
    }

    public function product(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function deliveryLink(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(DeliveryLink::class);
    }

    public function inventoryItem(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(InventoryItem::class);
    }

    public function deliveryLogs(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(DeliveryLog::class);
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isDelivered(): bool
    {
        return $this->delivery_status === 'product_viewed';
    }
}
