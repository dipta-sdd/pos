<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Membership;

class VendorScope
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Get the user's active vendor through membership
        $membership = Membership::where('user_id', $user->id)
            ->where('is_active', true)
            ->with('vendor')
            ->first();

        if (!$membership || !$membership->vendor) {
            return response()->json(['error' => 'No active vendor found'], 403);
        }

        // Add vendor to request for controllers to use
        $request->merge(['vendor_id' => $membership->vendor_id]);
        $request->merge(['vendor' => $membership->vendor]);
        
        return $next($request);
    }
} 