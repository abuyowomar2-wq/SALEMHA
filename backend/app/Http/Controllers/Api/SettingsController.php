<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Merchant\UpdateSettingsRequest;
use Illuminate\Http\JsonResponse;

class SettingsController extends Controller
{
    public function show(): JsonResponse
    {
        $merchant = request()->user()->merchant;

        return response()->json([
            'store_name' => $merchant->store_name,
            'store_slug' => $merchant->store_slug,
            'logo_url' => $merchant->logo_url,
            'primary_color' => $merchant->primary_color,
            'verification_method' => $merchant->verification_method,
            'salla_api_key' => $merchant->salla_api_key,
            'salla_store_url' => $merchant->salla_store_url,
            'whatsapp_phone' => $merchant->whatsapp_phone,
            'settings' => $merchant->settings,
        ]);
    }

    public function update(UpdateSettingsRequest $request): JsonResponse
    {
        $merchant = request()->user()->merchant;
        $merchant->update($request->validated());

        return response()->json([
            'message' => 'تم تحديث الإعدادات بنجاح',
            'settings' => [
                'store_name' => $merchant->store_name,
                'store_slug' => $merchant->store_slug,
                'logo_url' => $merchant->logo_url,
                'primary_color' => $merchant->primary_color,
                'verification_method' => $merchant->verification_method,
                'settings' => $merchant->settings,
            ],
        ]);
    }
}
