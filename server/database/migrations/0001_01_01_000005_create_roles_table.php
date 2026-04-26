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

            // Access Control Permissions
            // Consolidates Users, Roles, and Activity Logs
            // Backend APIs: GET /users, GET /roles, GET /activity-logs
            $table->boolean('can_view_access_control')->default(true);
            // Backend APIs: POST/PUT /users, POST/PUT /roles
            $table->boolean('can_manage_access_control')->default(false);
            // Backend APIs: DELETE /users, DELETE /roles
            $table->boolean('can_delete_access_control')->default(false);

            // Product & Catalog Permissions
            // Sidebar => Catalog -> Products, Categories, Units
            // Backend APIs: GET /products, GET /categories, GET /units-of-measure
            $table->boolean('can_view_catalog')->default(true);
            // Backend APIs: POST/PUT /products, POST/PUT /categories, POST/PUT /units-of-measure, /import, /export, etc.
            $table->boolean('can_manage_catalog')->default(false);
            // Backend APIs: DELETE /products, DELETE /categories, DELETE /units-of-measure
            $table->boolean('can_delete_catalog')->default(false);

            // Organization Settings Permissions
            // Consolidates Branches, Counters, Payment Methods, Taxes, Receipts, and General Settings
            $table->boolean('can_view_organization_settings')->default(true);
            $table->boolean('can_edit_organization_settings')->default(false);
            $table->boolean('can_delete_organization_settings')->default(false);

            // Inventory & Stock Management
            // Used in Frontend: app/pos/vendor/[vendorId]/inventory/page.tsx, app/pos/vendor/[vendorId]/inventory/transfers/page.tsx, app/pos/vendor/[vendorId]/inventory/transfers/new/page.tsx, app/pos/vendor/[vendorId]/inventory/transfers/[transferId]/page.tsx
            // Sidebar => Inventory -> Stock Levels, Stock Transfers
            // Backend APIs: GET /branch-products, GET /stock-transfers, etc.
            $table->boolean('can_view_stock_and_inventory')->default(false);
            // Used in Frontend: app/pos/vendor/[vendorId]/inventory/adjustments/page.tsx, app/pos/vendor/[vendorId]/inventory/_components/AddStockModal.tsx, app/pos/vendor/[vendorId]/inventory/_components/ViewStockModal.tsx
            // Sidebar => Inventory -> Stock Adjustments
            // Backend APIs: POST /branch-products/add-stock, POST /stock-transfers, POST /inventory-adjustments, etc.
            $table->boolean('can_manage_stock_and_inventory')->default(false);

            // Operations & Procurement Permissions
            // Consolidates Purchase Orders, Suppliers, and Expenses
            // Backend APIs: GET /purchase-orders, GET /suppliers, GET /expenses
            $table->boolean('can_view_operations')->default(false);
            // Backend APIs: POST/PUT /purchase-orders, POST/PUT /suppliers, POST/PUT /expenses
            $table->boolean('can_manage_operations')->default(false);
            // Backend APIs: DELETE /purchase-orders, DELETE /suppliers, DELETE /expenses
            $table->boolean('can_delete_operations')->default(false);


            // Backend APIs: POST /cash-transactions
            // confirmed end

            // depricated start - this permissions will be later we first have to make sure where they are in use
            // depricated end

            // dont-know start - most of these permissions are in use ,but we will devide many of them in multiple permissions

            // User Management Permissions
            // Sidebar => Operations -> Audit Log
            // Backend APIs: GET /activity-logs, GET /activity-logs/{activityLog}

            // Inventory Management Permissions
            
            

            // Sales & POS Permissions
            // Sidebar => Point of Sale (POS), Sales History
            // Backend APIs: GET /sales, POST /sales, GET /sales/{sale}, GET /pos/active-session, GET /pos/customers, GET /pos/payment-methods, GET /pos/products, GET /pos/products/stocks, POST /pos/calculate-discounts
            $table->boolean('can_use_pos')->default(false); // include sales history
            // Used in Frontend: POS checkout pricing overrides
            $table->boolean('can_manage_checkout_pricing')->default(false); // override prices, manual discounts
            // Used in Frontend: app/pos/vendor/[vendorId]/sales/page.tsx
            // Backend APIs: PUT /sales/{sale}, POST /sales/{sale}/void, DELETE /sales/{sale}
            $table->boolean('can_manage_sales')->default(false); // edit, void, delete sales

            // Returns Permissions
            // Sidebar => Sales -> Returns
            // Backend APIs: GET /sale-returns, POST /sale-returns, GET /sale-returns/{saleReturn}, PUT /sale-returns/{saleReturn}, DELETE /sale-returns/{saleReturn}
            $table->boolean('can_process_returns')->default(false);
            $table->boolean('can_issue_cash_refunds')->default(false);
            // Sidebar => Sales -> Store Credits
            // Backend APIs: GET /customer-store-credits, POST /customer-store-credits, GET /customer-store-credits/{customerStoreCredit}, PUT /customer-store-credits/{customerStoreCredit}, DELETE /customer-store-credits/{customerStoreCredit}
            $table->boolean('can_issue_store_credit')->default(false);

            // Customer Management Permissions
            // Sidebar => Sales -> Customers
            // Backend APIs: GET /customers, GET /customers/{customer}
            $table->boolean('can_view_customers')->default(false);
            // Backend APIs: POST /customers, POST /customers/import, PUT /customers/{customer}
            $table->boolean('can_edit_customers')->default(false);
            // Backend APIs: DELETE /customers/{customer}
            $table->boolean('can_delete_customers')->default(false);

            // Promotions & Discounts Permissions
            // Sidebar => Sales -> Promotions
            // Backend APIs: GET /promotions, GET /promotions/{promotion}
            $table->boolean('can_view_promotions')->default(false);
            // Backend APIs: POST /promotions, PUT /promotions/{promotion}
            $table->boolean('can_edit_promotions')->default(false);
            // Backend APIs: DELETE /promotions/{promotion}
            $table->boolean('can_delete_promotions')->default(false);

            // Financial & Cash Management Permissions
            // Backend APIs: POST /cash-register-sessions/open, POST /cash-register-sessions/{cashRegisterSession}/close, PUT /cash-register-sessions/{cashRegisterSession}, DELETE /cash-register-sessions/{cashRegisterSession}, POST /cash-transactions, GET /cash-transactions
            $table->boolean('can_manage_cash_drawer')->default(false);

            // Reports & Analytics Permissions
            // Backend APIs: GET /dashboard/stats, GET /reports/sales, GET /reports/financial, GET /reports/inventory, GET /cash-register-sessions
            $table->boolean('can_view_reports')->default(false);
            
            // Advanced Financial Data
            // Backend APIs: GET /customers/export, GET /sales/export
            $table->boolean('can_view_financial_analytics')->default(false);

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