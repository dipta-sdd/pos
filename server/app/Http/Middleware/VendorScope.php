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

        // Get vendor id from request route (matches /vendors/{id} and similar)
        $vendorId = $request->route('id');
        

        if (!$vendorId) {
            return response()->json(['error' => 'Vendor id is required'], 400);
        }

        // Check if the user has membership with this vendor
        $membership = Membership::where('user_id', $user->id)
            ->where('vendor_id', $vendorId)
            ->with('role')
            ->first();


        if (!$membership || !$membership->role) {
            return response()->json(['error' => 'No active membership for this vendor'], 403);
        }

        $request->merge(['vendor_id' => $membership->vendor_id]);
        $request->merge(['role' => $membership->role]);

        return $next($request);
    }
} 