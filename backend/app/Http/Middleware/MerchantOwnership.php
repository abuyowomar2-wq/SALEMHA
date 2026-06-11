<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class MerchantOwnership
{
    public function handle(Request $request, Closure $next): mixed
    {
        $user = $request->user();

        if (! $user || ! $user->is_active) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        return $next($request);
    }
}
