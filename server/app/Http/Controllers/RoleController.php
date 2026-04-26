<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $query = Role::selectRaw('roles.*, CONCAT(created_by.firstName, " ", created_by.lastName) as created_by_name, CONCAT(updated_by.firstName, " ", updated_by.lastName) as updated_by_name')
            ->leftJoin('users as created_by', 'roles.created_by', '=', 'created_by.id')
            ->leftJoin('users as updated_by', 'roles.updated_by', '=', 'updated_by.id');

        $query->where('vendor_id', $request->vendor_id);

        // Always exclude System/Owner role from general listing if desired, 
        // or keep standard behavior. The original excluded Owner.
        $query->where('name', '!=', 'Owner');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');

        // Whitelist sortable columns
        $allowedSortColumns = ['name', 'created_at', 'updated_at', 'created_by', 'updated_by'];
        if (in_array($sortBy, $allowedSortColumns)) {
            $query->orderBy($sortBy, $sortDirection === 'asc' ? 'asc' : 'desc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = $request->input('per_page', 10);
        return $query->paginate($perPage);
    }

    private function permissionRules(): array
    {
        return [
            // User Management
            'can_view_users' => 'boolean',
            'can_edit_users' => 'boolean',
            'can_delete_users' => 'boolean',
            'can_view_roles' => 'boolean',
            'can_edit_roles' => 'boolean',
            'can_delete_roles' => 'boolean',
            'can_view_user_activity_log' => 'boolean',
            // Product & Catalog
            'can_view_products' => 'boolean',
            'can_edit_products' => 'boolean',
            'can_delete_products' => 'boolean',
            'can_import_products' => 'boolean',
            'can_export_products' => 'boolean',
            // Categories
            'can_view_categories' => 'boolean',
            'can_edit_categories' => 'boolean',
            'can_delete_categories' => 'boolean',
            // Units of Measure
            'can_view_units_of_measure' => 'boolean',
            'can_edit_units_of_measure' => 'boolean',
            'can_delete_units_of_measure' => 'boolean',
            // Organization Settings
            'can_view_organization_settings' => 'boolean',
            'can_edit_organization_settings' => 'boolean',
            'can_delete_organization_settings' => 'boolean',
            // Inventory & Stock Management
            'can_view_stock_and_inventory' => 'boolean',
            'can_manage_stock_and_inventory' => 'boolean',
            // Purchase Orders
            'can_view_purchase_orders' => 'boolean',
            'can_edit_purchase_orders' => 'boolean',
            'can_delete_purchase_orders' => 'boolean',
            // Suppliers
            'can_view_suppliers' => 'boolean',
            'can_edit_suppliers' => 'boolean',
            'can_delete_suppliers' => 'boolean',
            // Expenses
            'can_view_expenses' => 'boolean',
            'can_edit_expenses' => 'boolean',
            'can_delete_expenses' => 'boolean',
            // Cash Transactions
            'can_request_cash_transactions' => 'boolean',
            'can_approve_cash_transactions' => 'boolean',
            // Sales & POS
            'can_use_pos' => 'boolean',
            'can_manage_checkout_pricing' => 'boolean',
            'can_manage_sales' => 'boolean',
            // Returns
            'can_process_returns' => 'boolean',
            'can_issue_cash_refunds' => 'boolean',
            'can_issue_store_credit' => 'boolean',
            // Customers
            'can_view_customers' => 'boolean',
            'can_manage_customers' => 'boolean',
            // Promotions
            'can_view_promotions' => 'boolean',
            'can_manage_promotions' => 'boolean',
            // Financial
            'can_open_close_cash_register' => 'boolean',
            // Reports & Analytics
            'can_view_dashboard' => 'boolean',
            'can_view_reports' => 'boolean',
            'can_view_profit_loss_data' => 'boolean',
            'can_export_data' => 'boolean',
        ];
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate(array_merge([
            'name' => 'required|string|max:255',
            'vendor_id' => 'required|exists:vendors,id',
        ], $this->permissionRules()));

        $validatedData['created_by'] = $request->user()->id;
        $validatedData['updated_by'] = $request->user()->id;

        $role = Role::create($validatedData);

        return response()->json($role, 201);
    }

    public function show(Role $role)
    {
        return $role;
    }

    public function update(Request $request, Role $role)
    {
        if ($role->name === 'Owner') {
            return response()->json(['message' => 'System role cannot be modified'], 403);
        }

        $validatedData = $request->validate(array_merge([
            'name' => 'string|max:255',
        ], $this->permissionRules()));

        $validatedData['updated_by'] = $request->user()->id;

        $role->update($validatedData);

        return response()->json($role);
    }

    public function destroy(Role $role)
    {
        if ($role->name === 'Owner') {
            return response()->json(['message' => 'System role cannot be deleted'], 403);
        }

        $role->delete();

        return response()->json(null, 204);
    }
}
