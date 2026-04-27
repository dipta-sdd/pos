<?php

namespace App\Models;

use App\Traits\LogsActivity;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use LogsActivity;
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'name',
        // Access Control Permissions
        'can_view_access_control',
        'can_manage_access_control',
        'can_delete_access_control',
        // Product & Catalog Permissions
        'can_view_catalog',
        'can_manage_catalog',
        'can_delete_catalog',
        // Organization Settings
        'can_view_organization_settings',
        'can_edit_organization_settings',
        'can_delete_organization_settings',
        // Inventory & Stock Management
        'can_view_stock_and_inventory',
        'can_manage_stock_and_inventory',
        // Operations & Procurement
        'can_view_operations',
        'can_manage_operations',
        'can_delete_operations',
        // Cash Transaction Permissions
        // Sales & POS Permissions
        'can_use_pos',
        'can_manage_checkout_pricing',
        'can_manage_sales',
        // Returns Permissions
        'can_process_returns',
        'can_issue_cash_refunds',
        'can_issue_store_credit',
        'can_view_customers',
        'can_edit_customers',
        'can_delete_customers',
        // Promotions & Discounts Permissions
        'can_view_promotions',
        'can_edit_promotions',
        'can_delete_promotions',
        // Financial & Cash Management Permissions
        'can_manage_cash_drawer',
        // Reports & Analytics Permissions
        'can_view_reports',
        'can_view_financial_analytics',
        // Audit fields
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        // Access Control
        'can_view_access_control' => 'boolean',
        'can_manage_access_control' => 'boolean',
        'can_delete_access_control' => 'boolean',
        // Product & Catalog
        'can_view_catalog' => 'boolean',
        'can_manage_catalog' => 'boolean',
        'can_delete_catalog' => 'boolean',
        // Organization Settings
        'can_view_organization_settings' => 'boolean',
        'can_edit_organization_settings' => 'boolean',
        'can_delete_organization_settings' => 'boolean',
        // Inventory & Stock Management
        'can_view_stock_and_inventory' => 'boolean',
        'can_manage_stock_and_inventory' => 'boolean',
        // Operations & Procurement
        'can_view_operations' => 'boolean',
        'can_manage_operations' => 'boolean',
        'can_delete_operations' => 'boolean',
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
        'can_edit_customers' => 'boolean',
        'can_delete_customers' => 'boolean',
        // Promotions
        'can_view_promotions' => 'boolean',
        'can_edit_promotions' => 'boolean',
        'can_delete_promotions' => 'boolean',
        // Financial & Cash Management
        'can_manage_cash_drawer' => 'boolean',
        // Reports & Analytics
        'can_view_reports' => 'boolean',
        'can_view_financial_analytics' => 'boolean',
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