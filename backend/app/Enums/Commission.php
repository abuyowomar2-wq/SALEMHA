<?php

namespace App\Enums;

enum Commission: int
{
    case MONTHLY = 40;
    case YEARLY = 20;

    public static function calculate(string $plan, string $billingCycle): float
    {
        $price = Plan::price($plan, $billingCycle);

        $rate = $billingCycle === 'yearly' ? self::YEARLY->value : self::MONTHLY->value;

        if ($billingCycle === 'yearly') {
            return round($price * 12 * ($rate / 100), 2);
        }

        return round($price * ($rate / 100), 2);
    }
}
