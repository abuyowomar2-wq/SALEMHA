<?php

namespace App\Http\Middleware;

use App\Services\SubscriptionService;
use Closure;
use Illuminate\Http\Request;

class CheckPlanLimit
{
    public function handle(Request $request, Closure $next, string $action): mixed
    {
        $merchant = $request->user()->merchant;
        if (! $merchant) return $next($request);

        $service = app(SubscriptionService::class);

        $allowed = match ($action) {
            'product' => $service->canAddProduct($merchant),
            'inventory' => $service->canAddInventory($merchant),
            'order' => $service->canCreateOrder($merchant),
            default => true,
        };

        if (! $allowed) {
            return response()->json([
                'message' => 'لقد وصلت لحد الباقة. رقّي باقتك للاستمرار.',
                'plan_limit_reached' => true,
            ], 403);
        }

        return $next($request);
    }
}
