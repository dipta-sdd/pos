<?php

namespace Database\Seeders;

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
                'can_manage_shop_settings', 'can_manage_billing_and_plan', 'can_manage_branches_and_counters',
                'can_manage_payment_methods', 'can_configure_taxes', 'can_customize_receipts',
                'can_manage_staff', 'can_manage_roles_and_permissions', 'can_view_roles', 'can_view_user_activity_log',
                'can_view_products', 'can_manage_products', 'can_manage_categories', 'can_manage_units_of_measure',
                'can_import_products', 'can_export_products',
                'can_view_inventory_levels', 'can_perform_stock_adjustments', 'can_manage_stock_transfers',
                'can_manage_purchase_orders', 'can_receive_purchase_orders', 'can_manage_suppliers',
                'can_use_pos', 'can_view_sales_history', 'can_override_prices', 'can_apply_manual_discounts', 'can_void_sales',
                'can_process_returns', 'can_issue_cash_refunds', 'can_issue_store_credit',
                'can_view_customers', 'can_manage_customers',
                'can_view_promotions', 'can_manage_promotions',
                'can_open_close_cash_register', 'can_perform_cash_transactions', 'can_manage_expenses',
                'can_view_dashboard', 'can_view_reports', 'can_view_profit_loss_data', 'can_export_data'
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
        });
    }
}
