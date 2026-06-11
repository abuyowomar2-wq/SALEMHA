<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SallaService;
use Illuminate\Http\JsonResponse;

class SyncController extends Controller
{
    public function sallaOrders(): JsonResponse
    {
        $merchant = request()->user()->merchant;

        if (! $merchant->salla_api_key || ! $merchant->salla_store_url) {
            return response()->json([
                'message' => 'يرجى إدخال مفتاح API ورابط متجر سلة من الإعدادات أولاً',
            ], 400);
        }

        $service = app(SallaService::class);

        $result = $service->fetchOrders($merchant->salla_api_key, $merchant->salla_store_url);

        if (isset($result['error'])) {
            return response()->json(['message' => $result['error']], 422);
        }

        $importResult = $service->importOrders($result['orders'], $merchant->id);

        return response()->json([
            'message' => "تم استيراد {$importResult['imported']} طلب جديد. تم تخطي {$importResult['skipped']} طلب مكرر.",
            'salla_total' => $result['total'],
            'imported' => $importResult['imported'],
            'skipped' => $importResult['skipped'],
        ]);
    }
}
