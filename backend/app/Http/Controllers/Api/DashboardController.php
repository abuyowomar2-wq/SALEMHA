<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\Order;
use App\Models\Product;
use App\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $merchant = request()->user()->merchant;

        $totalOrders = Order::where('merchant_id', $merchant->id)->count();
        $deliveredOrders = Order::where('merchant_id', $merchant->id)
            ->where('delivery_status', 'product_viewed')->count();
        $pendingOrders = Order::where('merchant_id', $merchant->id)
            ->where('delivery_status', '!=', 'product_viewed')
            ->where('status', '!=', 'cancelled')->count();

        $totalProducts = Product::where('merchant_id', $merchant->id)->where('is_active', true)->count();
        $totalInventory = InventoryItem::whereHas('product', fn ($q) => $q->where('merchant_id', $merchant->id))->count();
        $availableInventory = InventoryItem::whereHas('product', fn ($q) => $q->where('merchant_id', $merchant->id))
            ->where('status', 'available')->count();

        $lowStockProducts = Product::where('merchant_id', $merchant->id)->where('is_active', true)
            ->withCount('availableItems')
            ->get()
            ->filter(fn ($p) => $p->available_items_count <= 5)
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'available' => $p->available_items_count,
            ])
            ->values();

        $subscriptionService = app(SubscriptionService::class);
        $planLimits = $subscriptionService->getUsage($merchant);
        $percentages = $subscriptionService->usagePercentage($merchant);

        return response()->json([
            'total_orders' => $totalOrders,
            'delivered_orders' => $deliveredOrders,
            'pending_orders' => $pendingOrders,
            'total_products' => $totalProducts,
            'total_inventory' => $totalInventory,
            'available_inventory' => $availableInventory,
            'low_stock_alerts' => $lowStockProducts,
            'plan' => $planLimits['plan'],
            'plan_label' => $planLimits['plan_label'],
            'plan_limits' => $planLimits['limits'],
            'plan_percentages' => $percentages,
        ]);
    }

    public function recentActivity(): JsonResponse
    {
        $merchant = request()->user()->merchant;

        $orders = Order::where('merchant_id', $merchant->id)
            ->with(['product:id,name', 'deliveryLink:order_id,token,is_active'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'product_name' => $order->product?->name,
                'customer_name' => $order->customer_name,
                'delivery_status' => $order->delivery_status,
                'created_at' => $order->created_at->diffForHumans(),
            ]);

        return response()->json(['recent_orders' => $orders]);
    }
}
