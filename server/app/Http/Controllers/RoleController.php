<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index()
    {
        return Role::paginate();
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'vendor_id' => 'required|exists:vendors,id',
            'can_manage_shop_settings' => 'boolean',
            'can_manage_billing_and_plan' => 'boolean',
            'can_manage_branches_and_counters' => 'boolean',
            'can_manage_payment_methods' => 'boolean',
            'can_configure_taxes' => 'boolean',
            'can_customize_receipts' => 'boolean',
            'can_manage_staff' => 'boolean',
            'can_manage_roles_and_permissions' => 'boolean',
            'can_view_user_activity_log' => 'boolean',
            'can_view_products' => 'boolean',
            'can_manage_products' => 'boolean',
            'can_manage_categories' => 'boolean',
            'can_manage_units_of_measure' => 'boolean',
            'can_import_products' => 'boolean',
            'can_export_products' => 'boolean',
            'can_view_inventory_levels' => 'boolean',
            'can_perform_stock_adjustments' => 'boolean',
            'can_manage_stock_transfers' => 'boolean',
            'can_manage_purchase_orders' => 'boolean',
            'can_receive_purchase_orders' => 'boolean',
            'can_manage_suppliers' => 'boolean',
            'can_use_pos' => 'boolean',
            'can_view_sales_history' => 'boolean',
            'can_override_prices' => 'boolean',
            'can_apply_manual_discounts' => 'boolean',
            'can_void_sales' => 'boolean',
            'can_process_returns' => 'boolean',
            'can_issue_cash_refunds' => 'boolean',
            'can_issue_store_credit' => 'boolean',
            'can_view_customers' => 'boolean',
            'can_manage_customers' => 'boolean',
            'can_view_promotions' => 'boolean',
            'can_manage_promotions' => 'boolean',
            'can_open_close_cash_register' => 'boolean',
            'can_perform_cash_transactions' => 'boolean',
            'can_manage_expenses' => 'boolean',
            'can_view_dashboard' => 'boolean',
            'can_view_reports' => 'boolean',
            'can_view_profit_loss_data' => 'boolean',
            'can_export_data' => 'boolean',
        ]);

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

        $validatedData = $request->validate([
            'name' => 'string|max:255',
            'can_manage_shop_settings' => 'boolean',
            'can_manage_billing_and_plan' => 'boolean',
            'can_manage_branches_and_counters' => 'boolean',
            'can_manage_payment_methods' => 'boolean',
            'can_configure_taxes' => 'boolean',
            'can_customize_receipts' => 'boolean',
            'can_manage_staff' => 'boolean',
            'can_manage_roles_and_permissions' => 'boolean',
            'can_view_user_activity_log' => 'boolean',
            'can_view_products' => 'boolean',
            'can_manage_products' => 'boolean',
            'can_manage_categories' => 'boolean',
            'can_manage_units_of_measure' => 'boolean',
            'can_import_products' => 'boolean',
            'can_export_products' => 'boolean',
            'can_view_inventory_levels' => 'boolean',
            'can_perform_stock_adjustments' => 'boolean',
            'can_manage_stock_transfers' => 'boolean',
            'can_manage_purchase_orders' => 'boolean',
            'can_receive_purchase_orders' => 'boolean',
            'can_manage_suppliers' => 'boolean',
            'can_use_pos' => 'boolean',
            'can_view_sales_history' => 'boolean',
            'can_override_prices' => 'boolean',
            'can_apply_manual_discounts' => 'boolean',
            'can_void_sales' => 'boolean',
            'can_process_returns' => 'boolean',
            'can_issue_cash_refunds' => 'boolean',
            'can_issue_store_credit' => 'boolean',
            'can_view_customers' => 'boolean',
            'can_manage_customers' => 'boolean',
            'can_view_promotions' => 'boolean',
            'can_manage_promotions' => 'boolean',
            'can_open_close_cash_register' => 'boolean',
            'can_perform_cash_transactions' => 'boolean',
            'can_manage_expenses' => 'boolean',
            'can_view_dashboard' => 'boolean',
            'can_view_reports' => 'boolean',
            'can_view_profit_loss_data' => 'boolean',
            'can_export_data' => 'boolean',
        ]);

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
