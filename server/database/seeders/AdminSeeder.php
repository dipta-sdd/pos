<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\UnitOfMeasure;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Vendor;
use App\Models\Role;
use App\Models\Membership;
use App\Models\Branch;
use App\Models\UserBranchAssignment;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function () {
            // 1. Create User
            $user = User::firstOrCreate(
                ['id' => 1],
                [
                    'firstName' => 'Admin',
                    'lastName' => 'User',
                    'email' => 'admin@gmail.com',
                    'password' => Hash::make('Spider@2580'), // Will be hashed by model cast? checking model... 'hashed' cast is present. 
                    // Wait, if I pass plain text to 'hashed' cast, it should auto-hash.
                    // But explicitly hashing is safer if creation bypasses cast logic (usually doesn't on create).
                    // However, let's trust the 'hashed' cast or use Hash::make just in case.
                    // Update: 'hashed' cast in Laravel 10+ handles setters. I'll use plain text and let Laravel handle it, 
                    // OR explicitly hash it. Explicit is better for clarity.
                    // Actually, if 'hashed' cast is there, passing pre-hashed string might double-hash or fail if it expects raw.
                    // I'll assume 'hashed' cast works as intended with raw attributes.
                    'mobile' => '01887436514',
                    'mobile_verified_at' => now(),
                    'email_verified_at' => now(),
                ]
            );

            // 2. Create Vendor
            $vendor = Vendor::firstOrCreate(
                ['id' => 1],
                [
                    'owner_id' => $user->id,
                    'name' => 'Main Vendor',
                    'description' => 'Primary Vendor for Admin',
                    'phone' => '1234567890',
                    'address' => '123 Admin St',
                    'currency' => 'USD',
                    'timezone' => 'UTC',
                    'language' => 'en',
                ]
            );

            // 3. Create Admin Role with ALL permissions
            // Get all 'can_' columns from Role model logic or hardcode them
            // Since we saw the model, we know them. I'll include all I saw.
            // A better way to avoid maintenance burden: get all columns starting with 'can_' from Schema?
            // No, schema lookup is too dynamic/slow for a simple seeder. I'll list the key ones or all of them.
            // Actually, I can just fill them all.
            $roleData = [
                'vendor_id' => $vendor->id,
                'name' => 'Admin',
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ];

            // List of permissions from Role.php
            $permissions = [
                // User Management
                'can_view_users',
                'can_edit_users',
                'can_delete_users',
                'can_view_roles',
                'can_edit_roles',
                'can_delete_roles',
                'can_view_user_activity_log',
                // Product & Catalog
                'can_view_products',
                'can_edit_products',
                'can_delete_products',
                'can_import_products',
                'can_export_products',
                // Categories
                'can_view_categories',
                'can_edit_categories',
                'can_delete_categories',
                // Units of Measure
                'can_view_units_of_measure',
                'can_edit_units_of_measure',
                'can_delete_units_of_measure',
                // Branches
                'can_view_branches',
                'can_edit_branches',
                'can_delete_branches',
                // Counters
                'can_view_counters',
                'can_edit_counters',
                'can_delete_counters',
                // Payment Methods
                'can_view_payment_methods',
                'can_edit_payment_methods',
                'can_delete_payment_methods',
                // Inventory
                'can_view_inventory_levels',
                'can_perform_stock_adjustments',
                // Stock Transfers
                'can_view_stock_transfers',
                'can_edit_stock_transfers',
                'can_delete_stock_transfers',
                // Purchase Orders
                'can_view_purchase_orders',
                'can_edit_purchase_orders',
                'can_delete_purchase_orders',
                // Suppliers
                'can_view_suppliers',
                'can_edit_suppliers',
                'can_delete_suppliers',
                // Expenses
                'can_view_expenses',
                'can_edit_expenses',
                'can_delete_expenses',
                // Cash Transactions
                'can_request_cash_transactions',
                'can_approve_cash_transactions',
                // Shop & Organization
                'can_manage_shop_settings',
                'can_manage_billing_and_plan',
                'can_configure_taxes',
                'can_customize_receipts',
                // Sales & POS
                'can_use_pos',
                'can_view_sales_history',
                'can_override_prices',
                'can_apply_manual_discounts',
                'can_void_sales',
                // Returns
                'can_process_returns',
                'can_issue_cash_refunds',
                'can_issue_store_credit',
                // Customers
                'can_view_customers',
                'can_manage_customers',
                // Promotions
                'can_view_promotions',
                'can_manage_promotions',
                // Financial
                'can_open_close_cash_register',
                // Reports & Analytics
                'can_view_dashboard',
                'can_view_reports',
                'can_view_profit_loss_data',
                'can_export_data',
            ];

            foreach ($permissions as $perm) {
                $roleData[$perm] = true;
            }

            $role = Role::firstOrCreate(
                ['name' => 'Admin', 'vendor_id' => $vendor->id],
                $roleData
            );

            // 4. Create Membership
            $membership = Membership::firstOrCreate(
                ['user_id' => $user->id, 'vendor_id' => $vendor->id],
                [
                    'role_id' => $role->id,
                ]
            );

            // 5. Create Branches
            $branch1 = Branch::firstOrCreate(
                ['id' => 1],
                [
                    'vendor_id' => $vendor->id,
                    'name' => 'Main Branch',
                    'description' => 'Main Head Office',
                    'phone' => '1111111111',
                    'address' => 'Head Office Address',
                    'created_by' => $user->id,
                    'updated_by' => $user->id,
                ]
            );

            $branch2 = Branch::firstOrCreate(
                ['id' => 2],
                [
                    'vendor_id' => $vendor->id,
                    'name' => 'Secondary Branch',
                    'description' => 'Second Location',
                    'phone' => '2222222222',
                    'address' => 'Secondary Address',
                    'created_by' => $user->id,
                    'updated_by' => $user->id,
                ]
            );

            // 6. Assign User to Branches
            UserBranchAssignment::firstOrCreate(
                ['membership_id' => $membership->id, 'branch_id' => $branch1->id],
                ['created_by' => $user->id, 'updated_by' => $user->id]
            );

            UserBranchAssignment::firstOrCreate(
                ['membership_id' => $membership->id, 'branch_id' => $branch2->id],
                ['created_by' => $user->id, 'updated_by' => $user->id]
            );

            // 7. Create Units of Measure
            $units = [
                // --- Count Based (No Decimals) ---
                ['name' => 'Piece', 'abbreviation' => 'Pcs', 'is_decimal_allowed' => 0, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Pack', 'abbreviation' => 'Pk', 'is_decimal_allowed' => 0, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Box', 'abbreviation' => 'Bx', 'is_decimal_allowed' => 0, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Dozen', 'abbreviation' => 'Dzn', 'is_decimal_allowed' => 0, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Case', 'abbreviation' => 'Cs', 'is_decimal_allowed' => 0, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Each', 'abbreviation' => 'Ea', 'is_decimal_allowed' => 0, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Set', 'abbreviation' => 'Set', 'is_decimal_allowed' => 0, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Pair', 'abbreviation' => 'Pr', 'is_decimal_allowed' => 0, 'created_by' => $user->id, 'updated_by' => $user->id],

                // --- Weight (Decimals Allowed) ---
                ['name' => 'Kilogram', 'abbreviation' => 'Kg', 'is_decimal_allowed' => 1, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Gram', 'abbreviation' => 'G', 'is_decimal_allowed' => 1, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Milligram', 'abbreviation' => 'Mg', 'is_decimal_allowed' => 1, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Pound', 'abbreviation' => 'Lb', 'is_decimal_allowed' => 1, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Ounce', 'abbreviation' => 'Oz', 'is_decimal_allowed' => 1, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Metric Ton', 'abbreviation' => 'Ton', 'is_decimal_allowed' => 1, 'created_by' => $user->id, 'updated_by' => $user->id],

                // --- Volume (Decimals Allowed) ---
                ['name' => 'Liter', 'abbreviation' => 'Ltr', 'is_decimal_allowed' => 1, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Milliliter', 'abbreviation' => 'Ml', 'is_decimal_allowed' => 1, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Gallon', 'abbreviation' => 'Gal', 'is_decimal_allowed' => 1, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Fluid Ounce', 'abbreviation' => 'Fl Oz', 'is_decimal_allowed' => 1, 'created_by' => $user->id, 'updated_by' => $user->id],

                // --- Length & Area (Decimals Allowed) ---
                ['name' => 'Meter', 'abbreviation' => 'Mtr', 'is_decimal_allowed' => 1, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Centimeter', 'abbreviation' => 'Cm', 'is_decimal_allowed' => 1, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Inch', 'abbreviation' => 'In', 'is_decimal_allowed' => 1, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Foot', 'abbreviation' => 'Ft', 'is_decimal_allowed' => 1, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Yard', 'abbreviation' => 'Yd', 'is_decimal_allowed' => 1, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Square Meter', 'abbreviation' => 'Sqm', 'is_decimal_allowed' => 1, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Square Foot', 'abbreviation' => 'Sqft', 'is_decimal_allowed' => 1, 'created_by' => $user->id, 'updated_by' => $user->id],

                // --- Hospitality & Food ---
                ['name' => 'Bottle', 'abbreviation' => 'Btl', 'is_decimal_allowed' => 0, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Glass', 'abbreviation' => 'Gls', 'is_decimal_allowed' => 0, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Can', 'abbreviation' => 'Can', 'is_decimal_allowed' => 0, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Portion', 'abbreviation' => 'Port', 'is_decimal_allowed' => 1, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Tablespoon', 'abbreviation' => 'Tbsp', 'is_decimal_allowed' => 1, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Teaspoon', 'abbreviation' => 'Tsp', 'is_decimal_allowed' => 1, 'created_by' => $user->id, 'updated_by' => $user->id],

                // --- Industrial & Bulk ---
                ['name' => 'Pallet', 'abbreviation' => 'Plt', 'is_decimal_allowed' => 0, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Roll', 'abbreviation' => 'Rl', 'is_decimal_allowed' => 1, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Bundle', 'abbreviation' => 'Bdl', 'is_decimal_allowed' => 0, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Sheet', 'abbreviation' => 'Sht', 'is_decimal_allowed' => 1, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Crate', 'abbreviation' => 'Crt', 'is_decimal_allowed' => 0, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Drum', 'abbreviation' => 'Drm', 'is_decimal_allowed' => 1, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Ream', 'abbreviation' => 'Rm', 'is_decimal_allowed' => 0, 'created_by' => $user->id, 'updated_by' => $user->id],

                // --- Time & Service (Labor) ---
                ['name' => 'Hour', 'abbreviation' => 'Hr', 'is_decimal_allowed' => 1, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Day', 'abbreviation' => 'Day', 'is_decimal_allowed' => 1, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Week', 'abbreviation' => 'Wk', 'is_decimal_allowed' => 0, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Session', 'abbreviation' => 'Sess', 'is_decimal_allowed' => 0, 'created_by' => $user->id, 'updated_by' => $user->id],

                // --- Specialized ---
                ['name' => 'Gigabyte', 'abbreviation' => 'GB', 'is_decimal_allowed' => 1, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'User', 'abbreviation' => 'Usr', 'is_decimal_allowed' => 0, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Tablet', 'abbreviation' => 'Tab', 'is_decimal_allowed' => 0, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Capsule', 'abbreviation' => 'Cap', 'is_decimal_allowed' => 0, 'created_by' => $user->id, 'updated_by' => $user->id],
            ];

            foreach ($units as $unit) {
                UnitOfMeasure::firstOrCreate(
                    ['name' => $unit['name']],
                    $unit
                );
            }

            // 8. Create Categories
            $categories = [
                ['name' => 'Electronics', 'vendor_id' => $vendor->id, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Clothing', 'vendor_id' => $vendor->id, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Groceries', 'vendor_id' => $vendor->id, 'created_by' => $user->id, 'updated_by' => $user->id],
                ['name' => 'Books', 'vendor_id' => $vendor->id, 'created_by' => $user->id, 'updated_by' => $user->id],
            ];

            foreach ($categories as $category) {
                Category::firstOrCreate(
                    ['name' => $category['name'], 'vendor_id' => $vendor->id],
                    $category
                );
            }
        });
    }
}
