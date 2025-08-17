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
        // Shop & Organization Permissions
        'can_manage_shop_settings',
        'can_manage_billing_and_plan',
        'can_manage_branches_and_counters',
        'can_manage_payment_methods',
        'can_configure_taxes',
        'can_customize_receipts',
        // User Management Permissions
        'can_manage_staff',
        'can_manage_roles_and_permissions',
        'can_view_user_activity_log',
        // Product & Catalog Permissions
        'can_view_products',
        'can_manage_products',
        'can_manage_categories',
        'can_manage_units_of_measure',
        'can_import_products',
        'can_export_products',
        // Inventory Management Permissions
        'can_view_inventory_levels',
        'can_perform_stock_adjustments',
        'can_manage_stock_transfers',
        'can_manage_purchase_orders',
        'can_receive_purchase_orders',
        'can_manage_suppliers',
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
        'can_perform_cash_transactions',
        'can_manage_expenses',
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