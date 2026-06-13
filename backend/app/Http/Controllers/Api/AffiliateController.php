<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Merchant;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AffiliateController extends Controller
{
    public function stats(): JsonResponse
    {
        // Merchants with affiliate codes
        $merchantAffiliates = Merchant::whereNotNull('affiliate_code')
            ->get()
            ->map(function ($merchant) {
                $referrals = Merchant::where('referred_by', $merchant->affiliate_code)->count();
                $activeSubs = Subscription::whereIn('merchant_id', 
                    Merchant::where('referred_by', $merchant->affiliate_code)->pluck('id')
                )->where('status', 'active')->count();

                $totalCommission = Subscription::where('referral_code', $merchant->affiliate_code)
                    ->where('status', 'active')
                    ->sum('commission_amount');

                return [
                    'id' => $merchant->id,
                    'name' => $merchant->store_name,
                    'affiliate_code' => $merchant->affiliate_code,
                    'type' => 'تاجر',
                    'total_referrals' => $referrals,
                    'active_subs' => $activeSubs,
                    'total_commission' => round($totalCommission, 2),
                ];
            });

        // Pure Marketers (users with affiliate_code)
        $marketerAffiliates = User::whereNotNull('affiliate_code')
            ->where('role', 'marketer')
            ->get()
            ->map(function ($user) {
                $referrals = Merchant::where('referred_by', $user->affiliate_code)->count();
                $activeSubs = Subscription::whereIn('merchant_id', 
                    Merchant::where('referred_by', $user->affiliate_code)->pluck('id')
                )->where('status', 'active')->count();

                $totalCommission = Subscription::where('referral_code', $user->affiliate_code)
                    ->where('status', 'active')
                    ->sum('commission_amount');

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'affiliate_code' => $user->affiliate_code,
                    'type' => 'مسوق',
                    'total_referrals' => $referrals,
                    'active_subs' => $activeSubs,
                    'total_commission' => round($totalCommission, 2),
                ];
            });

        $affiliates = $merchantAffiliates->concat($marketerAffiliates)
            ->filter(fn ($a) => $a['total_referrals'] > 0)
            ->values();

        return response()->json(['affiliates' => $affiliates]);
    }

    public function referrals(Merchant $merchant): JsonResponse
    {
        if (! $merchant->affiliate_code) {
            return response()->json(['referrals' => []]);
        }

        $referrals = Merchant::where('referred_by', $merchant->affiliate_code)
            ->with(['user:id,name,email'])
            ->get()
            ->map(function ($m) {
                $sub = Subscription::where('merchant_id', $m->id)
                    ->where('status', 'active')
                    ->latest()
                    ->first();

                return [
                    'store_name' => $m->store_name,
                    'user_name' => $m->user->name ?? '',
                    'plan' => $sub?->plan,
                    'commission' => $sub?->commission_amount,
                    'joined_at' => $m->created_at,
                ];
            });

        return response()->json(['referrals' => $referrals]);
    }
}
