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
            // Used in Frontend: app/pos/vendor/[vendorId]/users/page.tsx
            // Sidebar => Operations -> Users
            // Backend APIs: GET /memberships, GET /memberships/{membership}, GET /user-branch-assignments, GET /user-branch-assignments/{userBranchAssignment}, GET /users, GET /users/{user}
            $table->boolean('can_view_users')->default(true);
            // Backend APIs: POST /memberships, PUT /memberships/{membership}, POST /user-branch-assignments, PUT /user-branch-assignments/{userBranchAssignment}, POST /users, PUT /users/{user}
            $table->boolean('can_edit_users')->default(false);
            // Backend APIs: DELETE /memberships/{membership}, DELETE /user-branch-assignments/{userBranchAssignment}, DELETE /users/bulk, DELETE /users/{user}
            $table->boolean('can_delete_users')->default(false);

            // Used in Frontend: app/pos/vendor/[vendorId]/roles/[roleId]/page.tsx, app/pos/vendor/[vendorId]/roles/new/page.tsx, app/pos/vendor/[vendorId]/roles/page.tsx
            // Sidebar => Settings -> Roles & Permissions
            // Backend APIs: GET /roles, GET /roles/{role}, GET /memberships, GET /memberships/{membership}
            $table->boolean('can_view_roles')->default(true);
            // Backend APIs: POST /roles, PUT /roles/{role}
            $table->boolean('can_edit_roles')->default(false);
            // Backend APIs: DELETE /roles/{role}
            $table->boolean('can_delete_roles')->default(false);

            // Used in Frontend: app/pos/vendor/[vendorId]/products/new/page.tsx, app/pos/vendor/[vendorId]/products/page.tsx
            // Sidebar => Catalog -> Products
            // Backend APIs: GET /products, POST /products, GET /products/{id}, PUT /products/{id}, DELETE /products/{id}
            $table->boolean('can_view_products')->default(true);
            // Used in Frontend: app/pos/vendor/[vendorId]/products/[productId]/page.tsx, app/pos/vendor/[vendorId]/products/page.tsx
            // Backend APIs: GET /variants, POST /variants, GET /variants/{variant}, PUT /variants/{variant}, DELETE /variants/{variant}, POST /variants/{variant}/generate-barcode, POST /branch-products/toggle-status
            $table->boolean('can_edit_products')->default(false);
            // Used in Frontend: app/pos/vendor/[vendorId]/products/page.tsx
            // Backend APIs: POST /products/bulk-delete
            $table->boolean('can_delete_products')->default(false);

            // Used in Frontend: app/pos/vendor/[vendorId]/products/categories/page.tsx
            // Sidebar => Catalog -> Categories
            // Backend APIs: GET /categories, GET /categories/{category}
            $table->boolean('can_view_categories')->default(true);
            // Backend APIs: POST /categories, PUT /categories/{category}
            $table->boolean('can_edit_categories')->default(false);
            // Backend APIs: DELETE /categories/{category}
            $table->boolean('can_delete_categories')->default(false);

            // Used in Frontend: app/pos/vendor/[vendorId]/products/units/page.tsx
            // Sidebar => Catalog -> Units
            // Backend APIs: GET /units-of-measure, GET /units-of-measure/{unitOfMeasure}
            $table->boolean('can_view_units_of_measure')->default(true);
            // Backend APIs: POST /units-of-measure, PUT /units-of-measure/{unitOfMeasure}
            $table->boolean('can_edit_units_of_measure')->default(false);
            // Backend APIs: DELETE /units-of-measure/{unitOfMeasure}
            $table->boolean('can_delete_units_of_measure')->default(false);

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

            // Used in Frontend: app/pos/vendor/[vendorId]/procurement/orders/[orderId]/page.tsx, app/pos/vendor/[vendorId]/procurement/orders/new/page.tsx, app/pos/vendor/[vendorId]/procurement/orders/page.tsx
            // Backend APIs: GET /purchase-orders, GET /purchase-orders/{purchaseOrder}
            // Sidebar => Inventory -> Purchase Orders
            // Backend APIs: GET /purchase-orders, GET /purchase-orders/{purchaseOrder}
            $table->boolean('can_view_purchase_orders')->default(false);
            // Backend APIs: POST /purchase-orders, PUT /purchase-orders/{purchaseOrder}
            $table->boolean('can_edit_purchase_orders')->default(false);
            // Backend APIs: DELETE /purchase-orders/{purchaseOrder}
            $table->boolean('can_delete_purchase_orders')->default(false);

            // Used in Frontend: app/pos/vendor/[vendorId]/procurement/suppliers/page.tsx
            // Backend APIs: GET /suppliers, GET /suppliers/{supplier}
            // Sidebar => Inventory -> Suppliers
            // Backend APIs: GET /suppliers, GET /suppliers/{supplier}
            $table->boolean('can_view_suppliers')->default(false);
            // Backend APIs: POST /suppliers, PUT /suppliers/{supplier}
            $table->boolean('can_edit_suppliers')->default(false);
            // Backend APIs: DELETE /suppliers/{supplier}
            $table->boolean('can_delete_suppliers')->default(false);

            // Used in Frontend: app/pos/vendor/[vendorId]/expenses/categories/page.tsx, app/pos/vendor/[vendorId]/expenses/page.tsx
            // Backend APIs: GET /expense-categories, GET /expense-categories/{expenseCategory}, GET /expenses, GET /expenses/{expense}
            // Sidebar => Operations -> Expenses
            // Backend APIs: GET /expense-categories, GET /expense-categories/{expenseCategory}, GET /expenses, GET /expenses/{expense}
            $table->boolean('can_view_expenses')->default(false);
            // Backend APIs: POST /expense-categories, PUT /expense-categories/{expenseCategory}, POST /expenses, PUT /expenses/{expense}
            $table->boolean('can_edit_expenses')->default(false);
            // Backend APIs: DELETE /expense-categories/{expenseCategory}, DELETE /expenses/{expense}
            $table->boolean('can_delete_expenses')->default(false);


            // Backend APIs: POST /cash-transactions
            $table->boolean('can_request_cash_transactions')->default(false);
            // Backend APIs: GET /cash-transactions, GET /cash-transactions/{cashTransaction}
            $table->boolean('can_approve_cash_transactions')->default(false);
            // confirmed end

            // depricated start - this permissions will be later we first have to make sure where they are in use
            // depricated end

            // dont-know start - most of these permissions are in use ,but we will devide many of them in multiple permissions

            // User Management Permissions
            // Sidebar => Operations -> Audit Log
            // Backend APIs: GET /activity-logs, GET /activity-logs/{activityLog}
            $table->boolean('can_view_user_activity_log')->default(false);

            // Product & Catalog Permissions
            // Backend APIs: POST /products/import
            $table->boolean('can_import_products')->default(false);
            // Backend APIs: GET /products/export
            $table->boolean('can_export_products')->default(false);

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
            // Backend APIs: GET /cash-register-sessions, GET /cash-register-sessions/{cashRegisterSession}
            $table->boolean('can_view_cash_sessions')->default(false);
            // Sidebar => Operations -> Cash Management
            // Backend APIs: POST /cash-register-sessions/open, POST /cash-register-sessions/{cashRegisterSession}/close, PUT /cash-register-sessions/{cashRegisterSession}, DELETE /cash-register-sessions/{cashRegisterSession}
            $table->boolean('can_open_close_cash_register')->default(false);
            

            // Reports & Analytics Permissions
            // Sidebar => Dashboard
            // Backend APIs: GET /dashboard/stats
            $table->boolean('can_view_dashboard')->default(false);
            // Sidebar => Reports -> Financial Ledger, Sales Reports, Inventory Reports
            // Backend APIs: GET /reports/sales, GET /reports/financial, GET /reports/inventory
            $table->boolean('can_view_reports')->default(false);
            $table->boolean('can_view_profit_loss_data')->default(false);
            // Sidebar => Reports -> Data Exports
            // Backend APIs: GET /customers/export, GET /sales/export
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