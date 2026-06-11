<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Merchant;
use App\Models\Order;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            if (! $request->user() || $request->user()->role !== 'admin') {
                return response()->json(['message' => 'غير مصرح'], 403);
            }
            return $next($request);
        });
    }

    public function merchants(): JsonResponse
    {
        $merchants = Merchant::with('user:id,name,email,is_active')
            ->latest()
            ->paginate(20);

        return response()->json($merchants);
    }

    public function showMerchant(Merchant $merchant): JsonResponse
    {
        $merchant->load('user:id,name,email,is_active');

        $stats = [
            'total_orders' => Order::where('merchant_id', $merchant->id)->count(),
            'delivered_orders' => Order::where('merchant_id', $merchant->id)
                ->where('delivery_status', 'product_viewed')->count(),
        ];

        return response()->json([
            'merchant' => $merchant,
            'stats' => $stats,
        ]);
    }

    public function updateMerchantStatus(Merchant $merchant): JsonResponse
    {
        $merchant->update([
            'is_active' => request()->input('is_active', ! $merchant->is_active),
        ]);

        return response()->json([
            'message' => 'تم تحديث حالة المتجر',
            'merchant' => $merchant,
        ]);
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'total_merchants' => Merchant::count(),
            'active_merchants' => Merchant::where('is_active', true)->count(),
            'total_orders' => Order::count(),
            'delivered_orders' => Order::where('delivery_status', 'product_viewed')->count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
        ]);
    }
}
