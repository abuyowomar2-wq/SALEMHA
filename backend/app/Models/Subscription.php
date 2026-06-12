<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'merchant_id',
        'plan',
        'billing_cycle',
        'status',
        'amount',
        'bank_reference',
        'admin_notes',
        'starts_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function merchant(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Merchant::class);
    }
}
