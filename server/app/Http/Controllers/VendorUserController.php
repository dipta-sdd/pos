<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Membership;
use App\Models\UserBranchAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

/**
 * Handles user management within the context of a specific Vendor.
 * User relationships (roles, branches) are scoped via the Membership model.
 */
class VendorUserController extends Controller
{
    /**
     * Display a paginated listing of users belonging to a specific vendor.
     * Supports searching, sorting, and filtering by role or branch.
     */
    public function index(Request $request)
    {
        // 1. Validate incoming filter and pagination parameters
        $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'per_page' => 'nullable|integer',
            'search' => 'nullable|string',
            'sort_by' => 'nullable|string',
            'sort_direction' => 'nullable|in:asc,desc',
            'role_id' => 'nullable|exists:roles,id',
            'branch_ids' => 'nullable|array',
            'branch_ids.*' => 'exists:branches,id',
        ]);

        $vendorId = $request->vendor_id;
        $perPage = $request->per_page ?? 15;
        $search = $request->search;
        $sortBy = $request->sort_by ?? 'created_at';
        $sortDirection = $request->sort_direction ?? 'desc';
        $roleId = $request->role_id;
        $branchIds = $request->branch_ids;

        // 2. Build the query to find users who have a membership with this vendor
        $query = User::query()
            ->whereHas('memberships', function ($q) use ($vendorId, $roleId, $branchIds) {
                $q->where('vendor_id', $vendorId);
                
                // Filter by a specific role if provided
                if ($roleId && $roleId !== 'all') {
                    $q->where('role_id', $roleId);
                }
                
                // Filter by assigned branches if provided
                if ($branchIds && count($branchIds) > 0) {
                    $q->whereHas('userBranchAssignments', function ($bq) use ($branchIds) {
                        $bq->whereIn('branch_id', $branchIds);
                    });
                }
            })
            // Eager load vendor-specific relationships to avoid N+1 issues
            ->with([
                'memberships' => function ($q) use ($vendorId) {
                    $q->where('vendor_id', $vendorId)->with(['role', 'userBranchAssignments.branch']);
                }
            ]);

        // 3. Apply search filters (Name or Email)
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('firstName', 'like', "%{$search}%")
                    ->orWhere('lastName', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // 4. Apply sorting logic
        if (in_array($sortBy, ['firstName', 'lastName', 'email', 'created_at'])) {
            $query->orderBy($sortBy, $sortDirection);
        } else if ($sortBy === 'role') {
            // Complex sort: join roles table to order by role name
            $query->select('users.*')
                ->join('memberships', 'users.id', '=', 'memberships.user_id')
                ->join('roles', 'memberships.role_id', '=', 'roles.id')
                ->where('memberships.vendor_id', $vendorId)
                ->orderBy('roles.name', $sortDirection);
        }

        $users = $query->paginate($perPage);

        // 5. Transform the result to flatten vendor-specific data (role, branches, etc.)
        // This makes it easier for the frontend to consume the specific context of this vendor.
        $users->getCollection()->transform(function ($user) {
            $membership = $user->memberships->first();
            $user->role = $membership ? $membership->role : null;
            $user->joined_at = $membership ? $membership->created_at : null;
            $user->membership_id = $membership ? $membership->id : null;
            $user->branches = $membership ? $membership->userBranchAssignments->map(function ($assignment) {
                return $assignment->branch;
            }) : [];
            unset($user->memberships); // Remove intermediate relationship
            return $user;
        });

        return response()->json($users);
    }

    /**
     * Invite a new user or register an existing global user to a vendor.
     * Uses a Database Transaction to ensure atomicity.
     */
    public function store(Request $request)
    {
        $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
            'mobile' => 'nullable|string|max:20',
            'branches' => 'nullable|array',
            'branches.*' => 'exists:branches,id',
        ]);

        return DB::transaction(function () use ($request) {
            // Check if a global user already exists with this email
            $user = User::where('email', $request->email)->first();

            if (!$user) {
                // Create a completely new global user
                $user = User::create([
                    'firstName' => $request->firstName,
                    'lastName' => $request->lastName,
                    'email' => $request->email,
                    'mobile' => $request->mobile,
                    'password' => Hash::make($request->password),
                    'created_by' => $request->user()->id,
                    'updated_by' => $request->user()->id,
                ]);
            } else {
                // If user exists, check if they are already part of this vendor
                $exists = Membership::where('user_id', $user->id)
                    ->where('vendor_id', $request->vendor_id)
                    ->exists();

                if ($exists) {
                    return response()->json(['message' => 'User is already a member of this vendor.'], 422);
                }
            }

            // Create the membership link between the global User and the specific Vendor
            $membership = Membership::create([
                'user_id' => $user->id,
                'vendor_id' => $request->vendor_id,
                'role_id' => $request->role_id,
                'created_by' => $request->user()->id,
                'updated_by' => $request->user()->id,
            ]);

            // Assign the user to specific vendor branches if provided
            if ($request->has('branches')) {
                foreach ($request->branches as $branchId) {
                    UserBranchAssignment::create([
                        'membership_id' => $membership->id,
                        'branch_id' => $branchId,
                        'created_by' => $request->user()->id,
                        'updated_by' => $request->user()->id,
                    ]);
                }
            }

            // Prepare the response model
            $membership->load(['role', 'userBranchAssignments.branch']);
            $user->role = $membership->role;
            $user->membership_id = $membership->id;
            $user->joined_at = $membership->created_at;
            $user->branches = $membership->userBranchAssignments->map(fn($assign) => $assign->branch);

            return response()->json($user, 201);
        });
    }

    /**
     * Display the specific user details within the context of the vendor.
     */
    public function show(Request $request, $id)
    {
        $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
        ]);

        // Fetch user ensuring they belong to the vendor
        $user = User::where('id', $id)
            ->whereHas('memberships', function ($q) use ($request) {
                $q->where('vendor_id', $request->vendor_id);
            })
            ->with([
                'memberships' => function ($q) use ($request) {
                    $q->where('vendor_id', $request->vendor_id)->with(['role', 'userBranchAssignments.branch']);
                }
            ])
            ->firstOrFail();

        // Flatten attributes for the response
        $membership = $user->memberships->first();
        $user->role = $membership ? $membership->role : null;
        $user->role_id = $membership ? $membership->role_id : null;
        $user->joined_at = $membership ? $membership->created_at : null;
        $user->membership_id = $membership ? $membership->id : null;
        $user->branches = $membership ? $membership->userBranchAssignments->map(fn($assign) => $assign->branch) : [];
        $user->branch_ids = $membership ? $membership->userBranchAssignments->pluck('branch_id') : [];
        unset($user->memberships);

        return response()->json($user);
    }

    /**
     * Update user profile information or their role/branch permissions within the vendor.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'role_id' => 'required|exists:roles,id',
            'mobile' => 'nullable|string|max:20',
            'branches' => 'nullable|array',
            'branches.*' => 'exists:branches,id',
        ]);

        return DB::transaction(function () use ($request, $id) {
            $user = User::findOrFail($id);

            // Update basic profile info
            $user->update([
                'firstName' => $request->firstName,
                'lastName' => $request->lastName,
                'mobile' => $request->mobile,
                'updated_by' => $request->user()->id
            ]);

            // Find membership to update role context
            $membership = Membership::where('user_id', $id)
                ->where('vendor_id', $request->vendor_id)
                ->firstOrFail();

            if ((int) $membership->role_id !== (int) $request->role_id) {
                $membership->update([
                    'role_id' => $request->role_id,
                    'updated_by' => $request->user()->id
                ]);
            }

            // Sync Branch Assignments (Re-create strategy)
            UserBranchAssignment::where('membership_id', $membership->id)->delete();

            if ($request->has('branches')) {
                foreach ($request->branches as $branchId) {
                    UserBranchAssignment::create([
                        'membership_id' => $membership->id,
                        'branch_id' => $branchId,
                        'created_by' => $request->user()->id,
                        'updated_by' => $request->user()->id,
                    ]);
                }
            }

            // Re-load and prepare response
            $membership->load(['role', 'userBranchAssignments.branch']);
            $user->role = $membership->role;
            $user->role_id = $membership->role_id;
            $user->branches = $membership->userBranchAssignments->map(fn($assign) => $assign->branch);

            return response()->json($user);
        });
    }

    /**
     * Remove a user's access from a vendor by deleting their membership link.
     */
    public function destroy(Request $request, $id)
    {
        $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
        ]);

        $membership = Membership::where('user_id', $id)
            ->where('vendor_id', $request->vendor_id)
            ->firstOrFail();

        // Cleanup assignments before removing membership
        UserBranchAssignment::where('membership_id', $membership->id)->delete();
        $membership->delete();

        return response()->json(['message' => 'User removed from vendor successfully.']);
    }

    /**
     * Bulk remove multiple users from a vendor.
     */
    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        $vendorId = $request->vendor_id;
        $userIds = $request->user_ids;

        return DB::transaction(function () use ($vendorId, $userIds) {
            // Find all memberships belonging to the user list within this vendor
            $memberships = Membership::whereIn('user_id', $userIds)
                ->where('vendor_id', $vendorId)
                ->get();

            $membershipIds = $memberships->pluck('id');

            // Delete memberships and their associated branch assignments
            Membership::whereIn('id', $membershipIds)->delete();
            UserBranchAssignment::whereIn('membership_id', $membershipIds)->delete();

            return response()->json([
                'message' => count($membershipIds) . ' users removed from vendor successfully.'
            ]);
        });
    }
}
