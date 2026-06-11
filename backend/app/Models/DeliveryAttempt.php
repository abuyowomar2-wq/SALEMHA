<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryAttempt extends Model
{
    protected $fillable = [
        'delivery_link_id',
        'ip_address',
        'user_agent',
        'input_data',
        'success',
        'failure_reason',
    ];

    protected function casts(): array
    {
        return [
            'input_data' => 'array',
            'success' => 'boolean',
        ];
    }

    public $timestamps = false;

    public function deliveryLink(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(DeliveryLink::class);
    }
}
