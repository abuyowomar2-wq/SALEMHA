<?php

namespace App\Http\Controllers\Api;

use App\Enums\Plan;
use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;

class SubscriptionController extends Controller
{
    public function current(): JsonResponse
    {
        $merchant = request()->user()->merchant;
        $service = app(SubscriptionService::class);

        $usage = $service->getUsage($merchant);
        $percentages = $service->usagePercentage($merchant);

        $latest = Subscription::where('merchant_id', $merchant->id)
            ->whereIn('status', ['active', 'pending'])
            ->latest()
            ->first();

        return response()->json([
            'plan' => $usage['plan'],
            'plan_label' => $usage['plan_label'],
            'limits' => $usage['limits'],
            'usage' => $usage['usage'],
            'percentages' => $percentages,
            'pending_upgrade' => $latest?->status === 'pending' ? [
                'plan' => $latest->plan,
                'amount' => $latest->amount,
                'billing_cycle' => $latest->billing_cycle,
                'created_at' => $latest->created_at,
            ] : null,
        ]);
    }

    public function upgrade(): JsonResponse
    {
        $request = request();
        $merchant = $request->user()->merchant;

        $validated = $request->validate([
            'plan' => ['required', 'string', 'in:growth,professional'],
            'billing_cycle' => ['required', 'string', 'in:monthly,yearly'],
            'bank_reference' => ['required', 'string', 'max:100'],
        ]);

        if ($validated['plan'] === $merchant->plan) {
            return response()->json(['message' => 'أنت مشترك بالفعل في هذه الباقة'], 422);
        }

        $pending = Subscription::where('merchant_id', $merchant->id)
            ->where('status', 'pending')
            ->exists();

        if ($pending) {
            return response()->json(['message' => 'لديك طلب ترقية قيد المراجعة'], 422);
        }

        $amount = Plan::price($validated['plan'], $validated['billing_cycle']);

        Subscription::create([
            'merchant_id' => $merchant->id,
            'plan' => $validated['plan'],
            'billing_cycle' => $validated['billing_cycle'],
            'status' => 'pending',
            'amount' => $amount,
            'bank_reference' => $validated['bank_reference'],
        ]);

        return response()->json([
            'message' => 'تم إرسال طلب الترقية. سنراجع التحويل ونسعد بتفعيل اشتراكك.',
            'amount' => $amount,
        ], 201);
    }

    public function history(): JsonResponse
    {
        $merchant = request()->user()->merchant;

        $subscriptions = Subscription::where('merchant_id', $merchant->id)
            ->latest()
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'plan' => Plan::from($s->plan)->label(),
                'billing_cycle' => $s->billing_cycle === 'yearly' ? 'سنوي' : 'شهري',
                'amount' => $s->amount,
                'status' => $s->status,
                'bank_reference' => $s->bank_reference,
                'created_at' => $s->created_at,
            ]);

        return response()->json(['subscriptions' => $subscriptions]);
    }
}
