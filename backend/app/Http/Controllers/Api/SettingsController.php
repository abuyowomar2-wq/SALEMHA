<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Merchant\UpdateSettingsRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    public function show(): JsonResponse
    {
        $merchant = request()->user()->merchant;

        return response()->json([
            'store_name' => $merchant->store_name,
            'store_slug' => $merchant->store_slug,
            'logo_url' => $merchant->logo_url ? asset('storage/' . $merchant->logo_url) : null,
            'primary_color' => $merchant->primary_color,
            'verification_method' => $merchant->verification_method,
            'settings' => $merchant->settings,
        ]);
    }

    public function update(UpdateSettingsRequest $request): JsonResponse
    {
        $merchant = request()->user()->merchant;

        $data = $request->validated();

        if ($request->hasFile('logo')) {
            if ($merchant->logo_url) {
                Storage::disk('public')->delete($merchant->logo_url);
            }
            $path = $request->file('logo')->store('logos', 'public');
            $data['logo_url'] = $path;
        }

        $merchant->update($data);

        return response()->json([
            'message' => 'تم تحديث الإعدادات بنجاح',
            'settings' => [
                'store_name' => $merchant->store_name,
                'store_slug' => $merchant->store_slug,
                'logo_url' => $merchant->logo_url ? asset('storage/' . $merchant->logo_url) : null,
                'primary_color' => $merchant->primary_color,
                'verification_method' => $merchant->verification_method,
                'settings' => $merchant->settings,
            ],
        ]);
    }
}
