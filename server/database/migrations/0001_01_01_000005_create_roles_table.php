<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('vendors')->onDelete('cascade');
            $table->string('name');

            // we have many permissions , we dont even know which one we are using which are not using ,and we also need to add more permisiions , so we can do one thing  we will devide our permisions in 3 sections , confirmed , depricated , dont-know

            // confirmed start - we will manualy add perssions here one by one 
            $table->boolean('can_view_users')->default(true);
            $table->boolean('can_edit_users')->default(false);
            $table->boolean('can_delete_users')->default(false);

            $table->boolean('can_view_roles')->default(true);
            $table->boolean('can_edit_roles')->default(false);
            $table->boolean('can_delete_roles')->default(false);

            $table->boolean('can_view_products')->default(true);
            $table->boolean('can_edit_products')->default(false);
            $table->boolean('can_delete_products')->default(false);

            $table->boolean('can_view_inventory_levels')->default(false);
            $table->boolean('can_perform_stock_adjustments')->default(false);

            $table->boolean('can_view_categories')->default(true);
            $table->boolean('can_edit_categories')->default(false);
            $table->boolean('can_delete_categories')->default(false);

            $table->boolean('can_view_units_of_measure')->default(true);
            $table->boolean('can_edit_units_of_measure')->default(false);
            $table->boolean('can_delete_units_of_measure')->default(false);

            $table->boolean('can_view_branches')->default(true);
            $table->boolean('can_edit_branches')->default(false);
            $table->boolean('can_delete_branches')->default(false);

            $table->boolean('can_view_counters')->default(true);
            $table->boolean('can_edit_counters')->default(false);
            $table->boolean('can_delete_counters')->default(false);

            $table->boolean('can_view_payment_methods')->default(true);
            $table->boolean('can_edit_payment_methods')->default(false);
            $table->boolean('can_delete_payment_methods')->default(false);

            $table->boolean('can_view_stock_transfers')->default(false);
            $table->boolean('can_edit_stock_transfers')->default(false);
            $table->boolean('can_delete_stock_transfers')->default(false);

            $table->boolean('can_view_purchase_orders')->default(false);
            $table->boolean('can_edit_purchase_orders')->default(false);
            $table->boolean('can_delete_purchase_orders')->default(false);

            $table->boolean('can_view_suppliers')->default(false);
            $table->boolean('can_edit_suppliers')->default(false);
            $table->boolean('can_delete_suppliers')->default(false);

            $table->boolean('can_view_expenses')->default(false);
            $table->boolean('can_edit_expenses')->default(false);
            $table->boolean('can_delete_expenses')->default(false);


            $table->boolean('can_request_cash_transactions')->default(false);
            $table->boolean('can_approve_cash_transactions')->default(false);
            // confirmed end

            // depricated start - this permissions will be later we first have to make sure where they are in use
            // depricated end

            // dont-know start - most of these permissions are in use ,but we will devide many of them in multiple permissions
            // Shop & Organization Permissions
            $table->boolean('can_manage_shop_settings')->default(false);
            $table->boolean('can_manage_billing_and_plan')->default(false);
            $table->boolean('can_configure_taxes')->default(false);
            $table->boolean('can_customize_receipts')->default(false);

            // User Management Permissions

            $table->boolean('can_view_user_activity_log')->default(false);

            // Product & Catalog Permissions
            $table->boolean('can_import_products')->default(false);
            $table->boolean('can_export_products')->default(false);

            // Inventory Management Permissions
            
            

            // Sales & POS Permissions
            $table->boolean('can_use_pos')->default(false); // also include counter session
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
            

            // Reports & Analytics Permissions
            $table->boolean('can_view_dashboard')->default(false);
            $table->boolean('can_view_reports')->default(false);
            $table->boolean('can_view_profit_loss_data')->default(false);
            $table->boolean('can_export_data')->default(false);

            //dont-know end

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