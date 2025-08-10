<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('vendors')->onDelete('cascade');
            $table->string('name');
            
            // Shop & Organization Permissions
            $table->boolean('can_manage_shop_settings')->default(false);
            $table->boolean('can_manage_billing_and_plan')->default(false);
            $table->boolean('can_manage_branches_and_counters')->default(false);
            $table->boolean('can_manage_payment_methods')->default(false);
            $table->boolean('can_configure_taxes')->default(false);
            $table->boolean('can_customize_receipts')->default(false);
            
            // User Management Permissions
            $table->boolean('can_manage_staff')->default(false);
            $table->boolean('can_manage_roles_and_permissions')->default(false);
            $table->boolean('can_view_user_activity_log')->default(false);
            
            // Product & Catalog Permissions
            $table->boolean('can_view_products')->default(false);
            $table->boolean('can_manage_products')->default(false);
            $table->boolean('can_manage_categories')->default(false);
            $table->boolean('can_manage_units_of_measure')->default(false);
            $table->boolean('can_import_products')->default(false);
            $table->boolean('can_export_products')->default(false);
            
            // Inventory Management Permissions
            $table->boolean('can_view_inventory_levels')->default(false);
            $table->boolean('can_perform_stock_adjustments')->default(false);
            $table->boolean('can_manage_stock_transfers')->default(false);
            $table->boolean('can_manage_purchase_orders')->default(false);
            $table->boolean('can_receive_purchase_orders')->default(false);
            $table->boolean('can_manage_suppliers')->default(false);
            
            // Sales & POS Permissions
            $table->boolean('can_use_pos')->default(false);
            $table->boolean('can_view_sales_history')->default(false);
            $table->boolean('can_override_prices')->default(false);
            $table->boolean('can_apply_manual_discounts')->default(false);
            $table->boolean('can_void_sales')->default(false);
            
            // Returns Permissions
            $table->boolean('can_process_returns')->default(false);
            $table->boolean('can_issue_cash_refunds')->default(false);
            $table->boolean('can_issue_store_credit')->default(false);
            
            // Customer Management Permissions
            $table->boolean('can_view_customers')->default(false);
            $table->boolean('can_manage_customers')->default(false);
            
            // Promotions & Discounts Permissions
            $table->boolean('can_view_promotions')->default(false);
            $table->boolean('can_manage_promotions')->default(false);
            
            // Financial & Cash Management Permissions
            $table->boolean('can_open_close_cash_register')->default(false);
            $table->boolean('can_perform_cash_transactions')->default(false);
            $table->boolean('can_manage_expenses')->default(false);
            
            // Reports & Analytics Permissions
            $table->boolean('can_view_dashboard')->default(false);
            $table->boolean('can_view_reports')->default(false);
            $table->boolean('can_view_profit_loss_data')->default(false);
            $table->boolean('can_export_data')->default(false);
            
            $table->timestamps();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            
            $table->unique(['vendor_id', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
}; 