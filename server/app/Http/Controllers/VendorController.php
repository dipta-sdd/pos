<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Vendor;
use App\Models\Membership;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;

class VendorController extends Controller
{
    /**
     * Display a listing of vendors.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $memberships = $request->user()->memberships()->with(['vendor.branches', 'role'])->get();

            return response()->json($memberships);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch vendors',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created vendor.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string',
                'currency' => 'required|string|max:3',
                'timezone' => 'required|string',
                'language' => 'required|string|max:5',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Create vendor
            $vendor = Vendor::create([
                'owner_id' => Auth::id(),
                'name' => $request->name,
                'description' => $request->description,
                'phone' => $request->phone,
                'address' => $request->address,
                'subscription_tier' => $request->subscription_tier ?? 'basic',
                'currency' => $request->currency,
                'timezone' => $request->timezone,
                'language' => $request->language,
            ]);

            // Create default role for the vendor owner
            $ownerRole = Role::create([
                'vendor_id' => $vendor->id,
                'name' => 'Owner',
                'description' => 'Vendor owner with full access',
                'can_manage_shop_settings' => true,
                'can_manage_billing_and_plan' => true,
                'can_manage_branches_and_counters' => true,
                'can_manage_payment_methods' => true,
                'can_configure_taxes' => true,
                'can_customize_receipts' => true,
                'can_manage_staff' => true,
                'can_manage_roles_and_permissions' => true,
                'can_view_user_activity_log' => true,
                'can_view_products' => true,
                'can_manage_products' => true,
                'can_manage_categories' => true,
                'can_manage_units_of_measure' => true,
                'can_import_products' => true,
                'can_export_products' => true,
                'can_view_inventory_levels' => true,
                'can_perform_stock_adjustments' => true,
                'can_manage_stock_transfers' => true,
                'can_manage_purchase_orders' => true,
                'can_receive_purchase_orders' => true,
                'can_manage_suppliers' => true,
                'can_use_pos' => true,
                'can_view_sales_history' => true,
                'can_override_prices' => true,
                'can_apply_manual_discounts' => true,
                'can_void_sales' => true,
                'can_process_returns' => true,
                'can_issue_cash_refunds' => true,
                'can_issue_store_credit' => true,
                'can_view_customers' => true,
                'can_manage_customers' => true,
                'can_view_promotions' => true,
                'can_manage_promotions' => true,
                'can_open_close_cash_register' => true,
                'can_perform_cash_transactions' => true,
                'can_manage_expenses' => true,
                'can_view_dashboard' => true,
                'can_view_reports' => true,
                'can_view_profit_loss_data' => true,
                'can_export_data' => true,
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
            ]);

            // Create membership for the vendor owner
            Membership::create([
                'user_id' => Auth::id(),
                'vendor_id' => $vendor->id,
                'role_id' => $ownerRole->id,
            ]);

            DB::commit();

            $vendor['role'] = $ownerRole;

            return response()->json($vendor, 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create vendor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified vendor.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $vendor = Vendor::with(['branches'])->findOrFail($id);
            $vendor['role'] = $request->role;
            return response()->json($vendor);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Vendor not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified vendor.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $vendor = Vendor::findOrFail($id);

            // Check if user has permission to update this vendor
            $membership = Membership::where('user_id', Auth::id())
                                  ->where('vendor_id', $id)
                                  ->first();

            if (!$membership) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to vendor'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string',
                'subscription_tier' => 'sometimes|required|in:basic,premium,enterprise',
                'currency' => 'sometimes|required|string|max:3',
                'timezone' => 'sometimes|required|string',
                'language' => 'sometimes|required|string|max:5',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $vendor->update($request->only([
                'name', 'description', 'phone', 'address',
                'subscription_tier', 'currency', 'timezone', 'language'
            ]));

            $vendor->load(['owner', 'memberships.user', 'roles']);

            return response()->json([
                'success' => true,
                'message' => 'Vendor updated successfully',
                'data' => $vendor
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update vendor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified vendor.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $vendor = Vendor::findOrFail($id);

            // Check if user is the owner of this vendor
            if ($vendor->owner_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only vendor owner can delete the vendor'
                ], 403);
            }

            DB::beginTransaction();

            // Delete related data
            $vendor->memberships()->delete();
            $vendor->roles()->delete();
            $vendor->branches()->delete();
            $vendor->products()->delete();
            $vendor->categories()->delete();
            $vendor->unitsOfMeasure()->delete();
            $vendor->suppliers()->delete();
            $vendor->customers()->delete();
            $vendor->taxes()->delete();
            $vendor->promotions()->delete();
            $vendor->sales()->delete();
            $vendor->purchaseOrders()->delete();
            $vendor->stockTransfers()->delete();
            $vendor->expenses()->delete();
            $vendor->expenseCategories()->delete();
            $vendor->paymentMethods()->delete();
            $vendor->returns()->delete();

            // Delete the vendor
            $vendor->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Vendor deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete vendor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get vendor statistics.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function statistics(int $id): JsonResponse
    {
        try {
            $vendor = Vendor::findOrFail($id);

            // Check if user has access to this vendor
            $membership = Membership::where('user_id', Auth::id())
                                  ->where('vendor_id', $id)
                                  ->first();

            if (!$membership) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to vendor'
                ], 403);
            }

            $stats = [
                'total_branches' => $vendor->branches()->count(),
                'total_products' => $vendor->products()->count(),
                'total_customers' => $vendor->customers()->count(),
                'total_suppliers' => $vendor->suppliers()->count(),
                'total_sales' => $vendor->sales()->count(),
                'total_purchase_orders' => $vendor->purchaseOrders()->count(),
                'total_members' => $vendor->memberships()->count(),
                'subscription_tier' => $vendor->subscription_tier,
                'currency' => $vendor->currency,
                'timezone' => $vendor->timezone,
                'language' => $vendor->language,
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch vendor statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get vendor members.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function members(int $id): JsonResponse
    {
        try {
            $vendor = Vendor::findOrFail($id);

            // Check if user has access to this vendor
            $membership = Membership::where('user_id', Auth::id())
                                  ->where('vendor_id', $id)
                                  ->first();

            if (!$membership) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to vendor'
                ], 403);
            }

            $members = $vendor->memberships()
                             ->with(['user', 'role'])
                             ->get();

            return response()->json([
                'success' => true,
                'data' => $members
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch vendor members',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add member to vendor.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function addMember(Request $request, int $id): JsonResponse
    {
        try {
            $vendor = Vendor::findOrFail($id);

            // Check if user has permission to add members
            $membership = Membership::where('user_id', Auth::id())
                                  ->where('vendor_id', $id)
                                  ->first();

            if (!$membership) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to vendor'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
                'role_id' => 'required|exists:roles,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if user is already a member
            $existingMembership = Membership::where('user_id', $request->user_id)
                                          ->where('vendor_id', $id)
                                          ->first();

            if ($existingMembership) {
                return response()->json([
                    'success' => false,
                    'message' => 'User is already a member of this vendor'
                ], 400);
            }

            $membership = Membership::create([
                'user_id' => $request->user_id,
                'vendor_id' => $id,
                'role_id' => $request->role_id,
            ]);

            $membership->load(['user', 'role']);

            return response()->json([
                'success' => true,
                'message' => 'Member added successfully',
                'data' => $membership
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add member',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove member from vendor.
     *
     * @param  int  $vendorId
     * @param  int  $memberId
     * @return \Illuminate\Http\JsonResponse
     */
    public function removeMember(int $vendorId, int $memberId): JsonResponse
    {
        try {
            $vendor = Vendor::findOrFail($vendorId);

            // Check if user has permission to remove members
            $membership = Membership::where('user_id', Auth::id())
                                  ->where('vendor_id', $vendorId)
                                  ->first();

            if (!$membership) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to vendor'
                ], 403);
            }

            $memberMembership = Membership::where('user_id', $memberId)
                                        ->where('vendor_id', $vendorId)
                                        ->first();

            if (!$memberMembership) {
                return response()->json([
                    'success' => false,
                    'message' => 'Member not found'
                ], 404);
            }

            // Prevent removing the vendor owner
            if ($vendor->owner_id === $memberId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot remove vendor owner'
                ], 400);
            }

            $memberMembership->delete();

            return response()->json([
                'success' => true,
                'message' => 'Member removed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove member',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 