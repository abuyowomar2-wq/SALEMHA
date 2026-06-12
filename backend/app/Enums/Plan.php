<?php

namespace App\Enums;

enum Plan: string
{
    case Starter = 'starter';
    case Growth = 'growth';
    case Professional = 'professional';

    public function label(): string
    {
        return match ($this) {
            self::Starter => 'بداية',
            self::Growth => 'نمو',
            self::Professional => 'احترافية',
        };
    }

    public static function limits(string $plan): array
    {
        return match ($plan) {
            'starter' => ['products' => 10, 'inventory' => 100, 'monthly_orders' => 10],
            'growth' => ['products' => 50, 'inventory' => 5000, 'monthly_orders' => 500],
            'professional' => ['products' => PHP_INT_MAX, 'inventory' => PHP_INT_MAX, 'monthly_orders' => PHP_INT_MAX],
            default => ['products' => 10, 'inventory' => 100, 'monthly_orders' => 10],
        };
    }

    public static function price(string $plan, string $billingCycle): float
    {
        $monthly = match ($plan) {
            'starter' => 0,
            'growth' => 75.99,
            'professional' => 99.00,
            default => 0,
        };

        if ($billingCycle === 'yearly') {
            return round($monthly * 0.7, 2);
        }

        return $monthly;
    }
}
