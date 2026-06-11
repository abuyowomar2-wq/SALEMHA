<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

class DeliveryLink extends Model
{
    protected $fillable = [
        'order_id',
        'token_hash',
        'is_active',
        'expires_at',
        'last_accessed_at',
    ];

    protected $hidden = [
        'token_hash',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'expires_at' => 'datetime',
            'last_accessed_at' => 'datetime',
        ];
    }

    public function order(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function attempts(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(DeliveryAttempt::class);
    }

    public function fullUrl(): Attribute
    {
        return Attribute::get(function () {
            return null;
        });
    }

    public static function generateToken(): string
    {
        return bin2hex(random_bytes(32));
    }

    public static function hashToken(string $rawToken): string
    {
        return hash('sha256', $rawToken);
    }

    public static function findByRawToken(string $rawToken): ?self
    {
        return static::where('token_hash', static::hashToken($rawToken))->first();
    }

    public function buildUrl(string $rawToken): string
    {
        $slug = $this->order?->merchant?->store_slug ?? 'unknown';

        return (string) config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000'))
            . "/d/{$slug}/{$rawToken}";
    }

    public function markAccessed(): void
    {
        $this->update(['last_accessed_at' => now()]);
    }
}
