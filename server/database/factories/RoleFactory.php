<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Role;
use App\Models\Vendor;
use App\Models\User;

class RoleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'vendor_id' => Vendor::factory(),
            'name' => 'Admin',
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
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
        ];
    }
}
