<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'name',
        // User Management Permissions
        'can_view_users',
        'can_edit_users',
        'can_delete_users',
        'can_view_roles',
        'can_edit_roles',
        'can_delete_roles',
        'can_view_user_activity_log',
        // Product & Catalog Permissions
        'can_view_products',
        'can_edit_products',
        'can_delete_products',
        'can_import_products',
        'can_export_products',
        // Category Permissions
        'can_view_categories',
        'can_edit_categories',
        'can_delete_categories',
        // Unit of Measure Permissions
        'can_view_units_of_measure',
        'can_edit_units_of_measure',
        'can_delete_units_of_measure',
        // Branch Permissions
        'can_view_branches',
        'can_edit_branches',
        'can_delete_branches',
        // Counter Permissions
        'can_view_counters',
        'can_edit_counters',
        'can_delete_counters',
        // Payment Method Permissions
        'can_view_payment_methods',
        'can_edit_payment_methods',
        'can_delete_payment_methods',
        // Inventory Management Permissions
        'can_view_inventory_levels',
        'can_perform_stock_adjustments',
        // Stock Transfer Permissions
        'can_view_stock_transfers',
        'can_edit_stock_transfers',
        'can_delete_stock_transfers',
        // Purchase Order Permissions
        'can_view_purchase_orders',
        'can_edit_purchase_orders',
        'can_delete_purchase_orders',
        // Supplier Permissions
        'can_view_suppliers',
        'can_edit_suppliers',
        'can_delete_suppliers',
        // Expense Permissions
        'can_view_expenses',
        'can_edit_expenses',
        'can_delete_expenses',
        // Cash Transaction Permissions
        'can_request_cash_transactions',
        'can_approve_cash_transactions',
        // Shop & Organization Permissions
        'can_manage_shop_settings',
        'can_manage_billing_and_plan',
        'can_configure_taxes',
        'can_customize_receipts',
        // Sales & POS Permissions
        'can_use_pos',
        'can_view_sales_history',
        'can_override_prices',
        'can_apply_manual_discounts',
        'can_void_sales',
        // Returns Permissions
        'can_process_returns',
        'can_issue_cash_refunds',
        'can_issue_store_credit',
        // Customer Management Permissions
        'can_view_customers',
        'can_manage_customers',
        // Promotions & Discounts Permissions
        'can_view_promotions',
        'can_manage_promotions',
        // Financial & Cash Management Permissions
        'can_open_close_cash_register',
        // Reports & Analytics Permissions
        'can_view_dashboard',
        'can_view_reports',
        'can_view_profit_loss_data',
        'can_export_data',
        // Audit fields
        'created_by',
        'updated_by',
    ];

    protected $casts = [
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
        // Branches
        'can_view_branches' => 'boolean',
        'can_edit_branches' => 'boolean',
        'can_delete_branches' => 'boolean',
        // Counters
        'can_view_counters' => 'boolean',
        'can_edit_counters' => 'boolean',
        'can_delete_counters' => 'boolean',
        // Payment Methods
        'can_view_payment_methods' => 'boolean',
        'can_edit_payment_methods' => 'boolean',
        'can_delete_payment_methods' => 'boolean',
        // Inventory
        'can_view_inventory_levels' => 'boolean',
        'can_perform_stock_adjustments' => 'boolean',
        // Stock Transfers
        'can_view_stock_transfers' => 'boolean',
        'can_edit_stock_transfers' => 'boolean',
        'can_delete_stock_transfers' => 'boolean',
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
        // Shop & Organization
        'can_manage_shop_settings' => 'boolean',
        'can_manage_billing_and_plan' => 'boolean',
        'can_configure_taxes' => 'boolean',
        'can_customize_receipts' => 'boolean',
        // Sales & POS
        'can_use_pos' => 'boolean',
        'can_view_sales_history' => 'boolean',
        'can_override_prices' => 'boolean',
        'can_apply_manual_discounts' => 'boolean',
        'can_void_sales' => 'boolean',
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
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }


    public function memberships(): HasMany
    {
        return $this->hasMany(Membership::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}