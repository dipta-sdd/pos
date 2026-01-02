<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $permission
     * @return mixed
     */
    public function handle(Request $request, Closure $next, $permission)
    {
        $user = $request->user();

        if (!$user) {
            abort(401, 'Unauthenticated.');
        }

        $vendorId = $request->route('vendor_id') ?? $request->input('vendor_id');

        if (!$vendorId) {
            abort(400, 'Vendor ID is required for this action.');
        }

        // Find the user's membership for this vendor
        // We use the relationship to ensure we're checking the authenticated user's memberships
        $membership = $user->memberships()
            ->where('vendor_id', $vendorId)
            ->with('role')
            ->first();

        if (!$membership || !$membership->role) {
            abort(403, 'Unauthorized action.');
        }

        // Check if the role has the required permission
        // Dynamic property access to check the boolean column on the role table
        if (!$membership->role->{$permission}) {
            abort(403, 'Unauthorized action.');
        }

        return $next($request);
    }
}
