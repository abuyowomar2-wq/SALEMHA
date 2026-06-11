<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        RateLimiter::for('delivery-verify', function ($request) {
            $token = $request->route('token');
            $ip = $request->ip();
            return Limit::perMinute(5)->by("verify:{$token}:{$ip}");
        });

        RateLimiter::for('delivery-verify-ip', function ($request) {
            return Limit::perMinute(15)->by("verify-ip:{$request->ip()}");
        });

        RateLimiter::for('auth-login', function ($request) {
            $email = $request->input('email', 'unknown');
            return Limit::perMinute(5)->by("login:{$email}:{$request->ip()}");
        });
    }
}
