<?php

namespace App\Http\Controllers\Api;

use App\Enums\Plan;
use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\JsonResponse;

class AdminSubscriptionController extends Controller
{
    public function index(): JsonResponse
    {
        $subscriptions = Subscription::with('merchant:id,store_name')
            ->latest()
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'store_name' => $s->merchant->store_name,
                'plan' => Plan::from($s->plan)->label(),
                'billing_cycle' => $s->billing_cycle === 'yearly' ? 'سنوي' : 'شهري',
                'amount' => $s->amount,
                'status' => $s->status,
                'bank_reference' => $s->bank_reference,
                'created_at' => $s->created_at,
            ]);

        return response()->json(['subscriptions' => $subscriptions]);
    }

    public function approve(Subscription $subscription): JsonResponse
    {
        if ($subscription->status !== 'pending') {
            return response()->json(['message' => 'الطلب ليس قيد المراجعة'], 422);
        }

        $duration = $subscription->billing_cycle === 'yearly' ? 365 : 30;

        $subscription->update([
            'status' => 'active',
            'starts_at' => now(),
            'expires_at' => now()->addDays($duration),
            'admin_notes' => request()->input('notes'),
        ]);

        $subscription->merchant->update(['plan' => $subscription->plan]);

        return response()->json(['message' => 'تم تفعيل الاشتراك بنجاح']);
    }

    public function reject(Subscription $subscription): JsonResponse
    {
        if ($subscription->status !== 'pending') {
            return response()->json(['message' => 'الطلب ليس قيد المراجعة'], 422);
        }

        $subscription->update([
            'status' => 'rejected',
            'admin_notes' => request()->input('notes'),
        ]);

        return response()->json(['message' => 'تم رفض الطلب']);
    }
}
