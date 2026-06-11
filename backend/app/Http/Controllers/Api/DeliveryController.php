<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Delivery\VerifyDeliveryRequest;
use App\Models\DeliveryLink;
use App\Models\Merchant;
use App\Services\DeliveryService;
use Illuminate\Http\JsonResponse;

class DeliveryController extends Controller
{
    public function show(string $slug, string $token): JsonResponse
    {
        $merchant = Merchant::where('store_slug', $slug)->first();

        if (! $merchant || ! $merchant->is_active) {
            return response()->json(['message' => 'المتجر غير موجود'], 404);
        }

        $link = DeliveryLink::findByRawToken($token);

        if (! $link || ! $link->is_active) {
            return response()->json(['message' => 'الرابط غير صالح'], 404);
        }

        if ($link->expires_at && $link->expires_at->isPast()) {
            return response()->json(['message' => 'انتهت صلاحية الرابط'], 410);
        }

        $link->markAccessed();

        $order = $link->order;

        if ($order->delivery_status !== 'product_viewed' && $order->delivery_status !== 'opened') {
            $order->update(['delivery_status' => 'opened']);
            \App\Models\DeliveryLog::create([
                'order_id' => $order->id,
                'event' => 'link_opened',
            ]);
        }

        return response()->json([
            'store_name' => $merchant->store_name,
            'store_logo' => $merchant->logo_url,
            'primary_color' => $merchant->primary_color,
            'verification_method' => $merchant->verification_method,
            'order_status' => $order->status,
            'delivery_status' => $order->delivery_status,
        ]);
    }

    public function verify(string $slug, string $token, VerifyDeliveryRequest $request): JsonResponse
    {
        $merchant = Merchant::where('store_slug', $slug)->first();

        if (! $merchant || ! $merchant->is_active) {
            return response()->json(['message' => 'المتجر غير موجود'], 404);
        }

        $link = DeliveryLink::findByRawToken($token);

        if (! $link || ! $link->is_active) {
            return response()->json(['message' => 'الرابط غير صالح'], 404);
        }

        $deliveryService = app(DeliveryService::class);
        $result = $deliveryService->verifyDelivery(
            $link,
            $request->input('order_number'),
            $request->input('customer_phone')
        );

        $status = $result['success'] ? 200 : 422;

        return response()->json($result, $status);
    }

    public function claim(string $slug, string $token): JsonResponse
    {
        $merchant = Merchant::where('store_slug', $slug)->first();

        if (! $merchant || ! $merchant->is_active) {
            return response()->json(['message' => 'المتجر غير موجود'], 404);
        }

        $link = DeliveryLink::findByRawToken($token);

        if (! $link || ! $link->is_active) {
            return response()->json(['message' => 'الرابط غير صالح'], 404);
        }

        $sessionToken = request()->input('session_token');

        if (! $sessionToken) {
            return response()->json(['message' => 'يجب التحقق من الطلب أولاً'], 403);
        }

        $deliveryService = app(DeliveryService::class);
        $result = $deliveryService->claimProduct($link->order, $sessionToken);

        return response()->json($result, $result['success'] ? 200 : 422);
    }
}
