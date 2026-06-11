<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Resources\DeliveryLogResource;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\DeliveryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $merchant = request()->user()->merchant;

        $orders = Order::where('merchant_id', $merchant->id)
            ->with(['deliveryLink', 'product'])
            ->latest()
            ->paginate(20);

        return OrderResource::collection($orders);
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $merchant = $request->user()->merchant;

        $order = Order::create([
            'merchant_id' => $merchant->id,
            ...$request->validated(),
            'status' => 'pending',
            'delivery_status' => 'not_sent',
        ]);

        $deliveryService = app(DeliveryService::class);
        $result = $deliveryService->createDeliveryLink($order);

        if (isset($result['error'])) {
            return response()->json(['message' => $result['error']], 422);
        }

        $order->load(['deliveryLink', 'product']);

        $response = [
            'message' => 'تم إنشاء الطلب بنجاح',
            'order' => new OrderResource($order),
        ];

        if (isset($result['raw_token'])) {
            $response['raw_token'] = $result['raw_token'];
        }

        return response()->json($response, 201);
    }

    public function show(Order $order): JsonResponse
    {
        if ($order->merchant_id !== request()->user()->merchant->id) {
            return response()->json(['message' => 'الطلب غير موجود'], 404);
        }

        $order->load(['deliveryLink', 'product']);

        return response()->json([
            'order' => new OrderResource($order),
        ]);
    }

    public function update(Request $request, Order $order): JsonResponse
    {
        if ($order->merchant_id !== $request->user()->merchant->id) {
            return response()->json(['message' => 'الطلب غير موجود'], 404);
        }

        $order->update($request->only([
            'customer_name', 'customer_phone', 'customer_email',
            'verification_code', 'status', 'notes',
        ]));

        return response()->json([
            'message' => 'تم تحديث الطلب بنجاح',
            'order' => new OrderResource($order->load(['deliveryLink', 'product'])),
        ]);
    }

    public function regenerateLink(Order $order): JsonResponse
    {
        if ($order->merchant_id !== request()->user()->merchant->id) {
            return response()->json(['message' => 'الطلب غير موجود'], 404);
        }

        if ($order->delivery_status === 'product_viewed') {
            return response()->json([
                'message' => 'تم تسليم هذا الطلب مسبقًا. لا يمكن إنشاء رابط جديد تلقائيًا. استخدم ميزة استبدال المنتج.',
            ], 422);
        }

        $deliveryService = app(DeliveryService::class);
        $result = $deliveryService->createDeliveryLink($order);

        if (isset($result['error'])) {
            return response()->json(['message' => $result['error']], 422);
        }

        return response()->json([
            'message' => 'تم إنشاء رابط تسليم جديد',
            'raw_token' => $result['raw_token'],
        ]);
    }

    public function logs(Order $order): AnonymousResourceCollection|JsonResponse
    {
        if ($order->merchant_id !== request()->user()->merchant->id) {
            return response()->json(['message' => 'الطلب غير موجود'], 404);
        }

        $logs = $order->deliveryLogs()->latest()->get();

        return DeliveryLogResource::collection($logs);
    }
}
