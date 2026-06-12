<?php

namespace App\Services;

use App\Enums\Plan;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\Product;

class SubscriptionService
{
    public function getLimits(string $plan): array
    {
        return Plan::limits($plan);
    }

    public function getUsage(Merchant $merchant): array
    {
        $limits = Plan::limits($merchant->plan);

        $productsCount = Product::where('merchant_id', $merchant->id)->count();
        $inventoryCount = \App\Models\InventoryItem::whereHas('product', fn ($q) => $q->where('merchant_id', $merchant->id))->count();
        $monthlyOrders = Order::where('merchant_id', $merchant->id)
            ->where('created_at', '>=', now()->startOfMonth())
            ->count();

        return [
            'plan' => $merchant->plan,
            'plan_label' => Plan::from($merchant->plan)->label(),
            'limits' => $limits,
            'usage' => [
                'products' => $productsCount,
                'inventory' => $inventoryCount,
                'monthly_orders' => $monthlyOrders,
            ],
        ];
    }

    public function canAddProduct(Merchant $merchant): bool
    {
        $limits = Plan::limits($merchant->plan);
        $count = Product::where('merchant_id', $merchant->id)->where('is_active', true)->count();
        return $count < $limits['products'];
    }

    public function canAddInventory(Merchant $merchant): bool
    {
        $limits = Plan::limits($merchant->plan);
        $count = \App\Models\InventoryItem::whereHas('product', fn ($q) => $q->where('merchant_id', $merchant->id))->count();
        return $count < $limits['inventory'];
    }

    public function canCreateOrder(Merchant $merchant): bool
    {
        $limits = Plan::limits($merchant->plan);
        $count = Order::where('merchant_id', $merchant->id)
            ->where('created_at', '>=', now()->startOfMonth())
            ->count();
        return $count < $limits['monthly_orders'];
    }

    public function usagePercentage(Merchant $merchant): array
    {
        $data = $this->getUsage($merchant);
        $limits = $data['limits'];
        $usage = $data['usage'];

        return [
            'products_pct' => $limits['products'] > 0 ? round(($usage['products'] / $limits['products']) * 100) : 0,
            'inventory_pct' => $limits['inventory'] > 0 ? round(($usage['inventory'] / $limits['inventory']) * 100) : 0,
            'orders_pct' => $limits['monthly_orders'] > 0 ? round(($usage['monthly_orders'] / $limits['monthly_orders']) * 100) : 0,
        ];
    }
}
