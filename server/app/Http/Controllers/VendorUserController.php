<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\Membership;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class VendorUserController extends Controller
{
    /**
     * Display a listing of the users for the specified vendor.
     */
    public function index(Request $request)
    {
        $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'per_page' => 'nullable|integer',
            'search' => 'nullable|string',
            'sort_by' => 'nullable|string',
            'sort_direction' => 'nullable|in:asc,desc',
        ]);

        $vendorId = $request->vendor_id;
        $perPage = $request->per_page ?? 15;
        $search = $request->search;
        $sortBy = $request->sort_by ?? 'created_at';
        $sortDirection = $request->sort_direction ?? 'desc';

        $query = User::query()
            ->whereHas('memberships', function ($q) use ($vendorId) {
                $q->where('vendor_id', $vendorId);
            })
            ->with([
                'memberships' => function ($q) use ($vendorId) {
                    $q->where('vendor_id', $vendorId)->with('role');
                }
            ]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('firstName', 'like', "%{$search}%")
                    ->orWhere('lastName', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Sorting logic
        if (in_array($sortBy, ['firstName', 'lastName', 'email', 'created_at'])) {
            $query->orderBy($sortBy, $sortDirection);
        } else if ($sortBy === 'role') {
            // Sort by role name needs a join or subquery, keeping it simple for now or implementing if needed
            $query->select('users.*')
                ->join('memberships', 'users.id', '=', 'memberships.user_id')
                ->join('roles', 'memberships.role_id', '=', 'roles.id')
                ->where('memberships.vendor_id', $vendorId)
                ->orderBy('roles.name', $sortDirection);
        }

        $users = $query->paginate($perPage);

        // Transform collection to include the specific role for this vendor context
        $users->getCollection()->transform(function ($user) {
            $membership = $user->memberships->first();
            $user->role = $membership ? $membership->role : null;
            $user->joined_at = $membership ? $membership->created_at : null;
            $user->membership_id = $membership ? $membership->id : null;
            unset($user->memberships);
            return $user;
        });

        return response()->json($users);
    }

    /**
     * Store a new user (or add existing) to the vendor.
     */
    public function store(Request $request)
    {
        $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'email' => 'required|email', // Removed unique:users check to allow inviting existing users logic if desired later, but for now let's assume new users or handle gracefully
            'password' => 'required|string|min:8', // Password required for new user creation
            'role_id' => 'required|exists:roles,id',
            'mobile' => 'nullable|string|max:20',
        ]);

        return DB::transaction(function () use ($request) {
            // Check if user exists
            $user = User::where('email', $request->email)->first();

            if (!$user) {
                $user = User::create([
                    'firstName' => $request->firstName,
                    'lastName' => $request->lastName,
                    'email' => $request->email,
                    'mobile' => $request->mobile,
                    'password' => Hash::make($request->password),
                ]);
            } else {
                // If user exists, ensure they are not already a member of this vendor
                $exists = Membership::where('user_id', $user->id)
                    ->where('vendor_id', $request->vendor_id)
                    ->exists();

                if ($exists) {
                    return response()->json(['message' => 'User is already a member of this vendor.'], 422);
                }
            }

            $membership = Membership::create([
                'user_id' => $user->id,
                'vendor_id' => $request->vendor_id,
                'role_id' => $request->role_id,
            ]);

            // Load the role relation for response
            $membership->load('role');

            $user->role = $membership->role;
            $user->membership_id = $membership->id;
            $user->joined_at = $membership->created_at;

            return response()->json($user, 201);
        });
    }

    /**
     * Display the specified user (contextualized to the vendor).
     */
    public function show(Request $request, $id)
    {
        $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
        ]);

        $user = User::where('id', $id)
            ->whereHas('memberships', function ($q) use ($request) {
                $q->where('vendor_id', $request->vendor_id);
            })
            ->with([
                'memberships' => function ($q) use ($request) {
                    $q->where('vendor_id', $request->vendor_id)->with('role');
                }
            ])
            ->firstOrFail();

        $membership = $user->memberships->first();
        $user->role = $membership ? $membership->role : null;
        $user->role_id = $membership ? $membership->role_id : null; // Convenience for frontend form
        $user->joined_at = $membership ? $membership->created_at : null;
        $user->membership_id = $membership ? $membership->id : null;
        unset($user->memberships);

        return response()->json($user);
    }

    /**
     * Update the specified user's details or role within the vendor.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'role_id' => 'required|exists:roles,id',
            'mobile' => 'nullable|string|max:20',
            // Password update is usually handled separately or optionally here
        ]);

        return DB::transaction(function () use ($request, $id) {
            $user = User::findOrFail($id);

            // Update User details (globally) - caution: this changes the user's name for all vendors they might be part of. 
            // For a POSSAAS, typically this is desired or user manages their own profile. 
            // Here assuming admin can update user profile.
            $user->update([
                'firstName' => $request->firstName,
                'lastName' => $request->lastName,
                'mobile' => $request->mobile,
            ]);

            // Update Membership (Role)
            $membership = Membership::where('user_id', $id)
                ->where('vendor_id', $request->vendor_id)
                ->firstOrFail();

            if ($membership->role_id !== $request->role_id) {
                $membership->update(['role_id' => $request->role_id]);
            }

            $membership->load('role');
            $user->role = $membership->role;
            $user->role_id = $membership->role_id;

            return response()->json($user);
        });
    }

    /**
     * Remove the specified user from the vendor.
     */
    public function destroy(Request $request, $id)
    {
        $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
        ]);

        $membership = Membership::where('user_id', $id)
            ->where('vendor_id', $request->vendor_id)
            ->firstOrFail();

        $membership->delete();

        return response()->json(['message' => 'User removed from vendor successfully.']);
    }
}
