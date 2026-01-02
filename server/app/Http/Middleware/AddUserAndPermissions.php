<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class AddUserAndPermissions
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check()) {
            $user = Auth::user()->load('memberships.role');
            $request->setUserResolver(function () use ($user) {
                return $user;
            });

            $permissions = $user->memberships->flatMap(function ($membership) {
                $role = $membership->role;
                if (!$role) {
                    return [];
                }
                return collect($role->getAttributes())->filter(function ($value, $key) {
                    return Str::startsWith($key, 'can_') && $value === true;
                })->keys();
            })->unique();

            $request->merge(['permissions' => $permissions]);
        }

        return $next($request);
    }
}
