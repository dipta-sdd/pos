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
use App\Models\Product;
use App\Models\Variant;
use App\Models\BranchProduct;
use App\Models\ProductStock;
use App\Models\BillingCounter;
use App\Models\PaymentMethod;

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
                    'settings' => [
                        'pos_interface' => 'touch',
                        'vat_rate' => 5,
                        'currency_symbol' => '৳',
                        'receipt_print_mode' => 'browser',
                        'auto_print_receipt' => false,
                    ],
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
                // Access Control
                'can_view_access_control',
                'can_manage_access_control',
                'can_delete_access_control',
                // Product & Catalog
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
                // Sales & POS
                'can_use_pos',
                'can_manage_checkout_pricing',
                'can_manage_sales',
                // Returns
                'can_process_returns',
                'can_issue_cash_refunds',
                'can_issue_store_credit',
                'can_view_customers',
                'can_edit_customers',
                'can_delete_customers',
                // Promotions
                'can_view_promotions',
                'can_edit_promotions',
                'can_delete_promotions',
                // Financial & Cash Management
                'can_manage_cash_drawer',
                // Reports & Analytics
                'can_view_reports',
                'can_view_financial_analytics',
            ];

            foreach ($permissions as $perm) {
                $roleData[$perm] = true;
            }

            $role = Role::firstOrCreate(
                ['name' => 'Admin', 'vendor_id' => $vendor->id],
                $roleData
            );

            // Create Manager Role (slightly restricted)
            $managerRoleData = $roleData;
            $managerRoleData['name'] = 'Manager';
            unset($managerRoleData['can_delete_access_control']);
            unset($managerRoleData['can_delete_organization_settings']);

            $managerRole = Role::firstOrCreate(
                ['name' => 'Manager', 'vendor_id' => $vendor->id],
                $managerRoleData
            );

            // 4. Create Memberships & Users
            $membership = Membership::firstOrCreate(
                ['user_id' => $user->id, 'vendor_id' => $vendor->id],
                [
                    'role_id' => $role->id,
                ]
            );

            // Manager 1
            $m1 = User::firstOrCreate(
                ['email' => 'manager1@gmail.com'],
                [
                    'firstName' => 'John',
                    'lastName' => 'Doe',
                    'password' => Hash::make('Spider@2580'),
                    'mobile' => '01711111111',
                    'mobile_verified_at' => now(),
                    'email_verified_at' => now(),
                ]
            );
            $mem1 = Membership::firstOrCreate(
                ['user_id' => $m1->id, 'vendor_id' => $vendor->id],
                ['role_id' => $managerRole->id]
            );

            // Manager 2
            $m2 = User::firstOrCreate(
                ['email' => 'manager2@gmail.com'],
                [
                    'firstName' => 'Jane',
                    'lastName' => 'Smith',
                    'password' => Hash::make('Spider@2580'),
                    'mobile' => '01722222222',
                    'mobile_verified_at' => now(),
                    'email_verified_at' => now(),
                ]
            );
            $mem2 = Membership::firstOrCreate(
                ['user_id' => $m2->id, 'vendor_id' => $vendor->id],
                ['role_id' => $managerRole->id]
            );

            // Manager 3
            $m3 = User::firstOrCreate(
                ['email' => 'manager3@gmail.com'],
                [
                    'firstName' => 'Alice',
                    'lastName' => 'Johnson',
                    'password' => Hash::make('Spider@2580'),
                    'mobile' => '01733333333',
                    'mobile_verified_at' => now(),
                    'email_verified_at' => now(),
                ]
            );
            $mem3 = Membership::firstOrCreate(
                ['user_id' => $m3->id, 'vendor_id' => $vendor->id],
                ['role_id' => $managerRole->id]
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
                    'branch_type' => 'warehouse',
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
                    'branch_type' => 'retail',
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

            // Assign Managers
            UserBranchAssignment::firstOrCreate(
                ['membership_id' => $mem1->id, 'branch_id' => $branch1->id],
                ['created_by' => $user->id, 'updated_by' => $user->id]
            );
            UserBranchAssignment::firstOrCreate(
                ['membership_id' => $mem2->id, 'branch_id' => $branch1->id],
                ['created_by' => $user->id, 'updated_by' => $user->id]
            );
            UserBranchAssignment::firstOrCreate(
                ['membership_id' => $mem3->id, 'branch_id' => $branch2->id],
                ['created_by' => $user->id, 'updated_by' => $user->id]
            );

            // 7. Create Billing Counters for each branch with associated payment methods
            $counters = [
                ['branch' => $branch1, 'name' => 'Counter 1'],
                ['branch' => $branch1, 'name' => 'Counter 2'],
                ['branch' => $branch2, 'name' => 'Main Counter'],
            ];

            foreach ($counters as $cData) {
                $counter = BillingCounter::firstOrCreate(
                    ['branch_id' => $cData['branch']->id, 'name' => $cData['name']],
                    ['created_by' => $user->id, 'updated_by' => $user->id]
                );

                PaymentMethod::firstOrCreate(
                    ['billing_counter_id' => $counter->id],
                    [
                        'vendor_id' => $vendor->id,
                        'branch_id' => $cData['branch']->id,
                        'name' => 'Cash - ' . $counter->name,
                        'type' => 'billing_counter',
                        'balance' => 0,
                        'total_collected' => 0,
                        'is_active' => true,
                        'created_by' => $user->id,
                        'updated_by' => $user->id,
                    ]
                );
            }

            // 8. Create Global Payment Methods
            $paymentMethods = [
                ['name' => 'Cash', 'type' => 'cash', 'is_active' => true],
                ['name' => 'Publai Bank', 'type' => 'card', 'is_active' => true],
                ['name' => 'Commercial Bank', 'type' => 'card', 'is_active' => true],
                ['name' => 'Awash Bank', 'type' => 'card', 'is_active' => true],
                ['name' => 'Dashen Bank', 'type' => 'card', 'is_active' => true],
                ['name' => 'Bank Transfer', 'type' => 'online', 'is_active' => true],
                ['name' => 'CBE Birr', 'type' => 'online', 'is_active' => true],
            ];

            foreach ($paymentMethods as $pm) {
                PaymentMethod::firstOrCreate(
                    ['vendor_id' => $vendor->id, 'name' => $pm['name']],
                    [
                        'type' => $pm['type'],
                        'is_active' => $pm['is_active'],
                        'balance' => 0,
                        'total_collected' => 0,
                        'created_by' => $user->id,
                        'updated_by' => $user->id,
                    ]
                );
            }

            // 8b. Create Receipt Settings
            \App\Models\ReceiptSettings::firstOrCreate(
                ['vendor_id' => $vendor->id],
                [
                    'header_text' => 'Thank you for shopping with us!',
                    'footer_text' => 'Please keep your receipt for returns.',
                    'show_logo' => false,
                    'show_address' => true,
                    'show_contact_info' => true,
                    'template_style' => 'default',
                    'font_size' => 'medium',
                    'show_tax_breakdown' => true,
                    'show_payment_details' => true,
                    'show_barcode' => false,
                    'show_salesperson' => true,
                    'show_sale_id' => true,
                    'show_date_time' => true,
                    'show_item_qty' => true,
                    'show_item_price' => true,
                    'show_item_unit' => false,
                    'show_item_discount' => false,
                    'show_item_tax' => false,
                    'show_item_total' => true,
                    'created_by' => $user->id,
                    'updated_by' => $user->id,
                ]
            );

            // 9. Create Units of Measure
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

            // 8b. Create 20 Suppliers (Manual)
            $suppliersData = [
                ['name' => 'Global Electronics Dist.', 'contact_person' => 'Mr. Smith', 'email' => 'smith@global.com', 'phone' => '10001', 'address' => 'USA'],
                ['name' => 'Fresh Foods Co.', 'contact_person' => 'Jane Food', 'email' => 'jane@fresh.com', 'phone' => '10002', 'address' => 'Local Farm'],
                ['name' => 'Tech Solutions Ltd', 'contact_person' => 'Bob Tech', 'email' => 'bob@tech.com', 'phone' => '10003', 'address' => 'Silicon Valley'],
                ['name' => 'Quality Apparel', 'contact_person' => 'Alice Cloth', 'email' => 'alice@quality.com', 'phone' => '10004', 'address' => 'China'],
                ['name' => 'Home Essentials Inc', 'contact_person' => 'Charlie Home', 'email' => 'charlie@home.com', 'phone' => '10005', 'address' => 'Furniture St'],
                ['name' => 'Office Depot Partner', 'contact_person' => 'David Office', 'email' => 'david@depot.com', 'phone' => '10006', 'address' => 'Downtown'],
                ['name' => 'Auto Parts Plus', 'contact_person' => 'Eva Auto', 'email' => 'eva@parts.com', 'phone' => '10007', 'address' => 'Garage Row'],
                ['name' => 'Pharma Supply Group', 'contact_person' => 'Frank Med', 'email' => 'frank@pharma.com', 'phone' => '10008', 'address' => 'Med Plaza'],
                ['name' => 'Build Mart', 'contact_person' => 'Grace Build', 'email' => 'grace@mart.com', 'phone' => '10009', 'address' => 'Construction Zone'],
                ['name' => 'Pet Care Solutions', 'contact_person' => 'Henry Pet', 'email' => 'henry@pet.com', 'phone' => '10010', 'address' => 'Pet Park'],
                ['name' => 'Mega Wholesale', 'contact_person' => 'Iris Bulk', 'email' => 'iris@mega.com', 'phone' => '10011', 'address' => 'Industrial Area'],
                ['name' => 'Stationery World', 'contact_person' => 'Jack Pen', 'email' => 'jack@world.com', 'phone' => '10012', 'address' => 'School St'],
                ['name' => 'Sports Gear Pro', 'contact_person' => 'Kelly Sport', 'email' => 'kelly@gear.com', 'phone' => '10013', 'address' => 'Stadium Way'],
                ['name' => 'Toy Kingdom', 'contact_person' => 'Leo Toy', 'email' => 'leo@kingdom.com', 'phone' => '10014', 'address' => 'Fairground'],
                ['name' => 'Green Energy Tech', 'contact_person' => 'Mia Green', 'email' => 'mia@energy.com', 'phone' => '10015', 'address' => 'Solar Heights'],
                ['name' => 'Global Logistics Co', 'contact_person' => 'Noah Log', 'email' => 'noah@global.com', 'phone' => '10016', 'address' => 'Port Harbor'],
                ['name' => 'Security Systems Inc', 'contact_person' => 'Olivia Sec', 'email' => 'olivia@security.com', 'phone' => '10017', 'address' => 'Safe Ave'],
                ['name' => 'Kitchen Master', 'contact_person' => 'Paul Cook', 'email' => 'paul@kitchen.com', 'phone' => '10018', 'address' => 'Culinary Blvd'],
                ['name' => 'Garden Life', 'contact_person' => 'Quinn Garden', 'email' => 'quinn@garden.com', 'phone' => '10019', 'address' => 'Botanical Rd'],
                ['name' => 'Music Vibes', 'contact_person' => 'Rose Tune', 'email' => 'rose@music.com', 'phone' => '10020', 'address' => 'Studio Lane'],
            ];

            foreach ($suppliersData as $s) {
                \App\Models\Supplier::firstOrCreate(
                    array_merge($s, [
                        'vendor_id' => $vendor->id,
                        'created_by' => $user->id,
                        'updated_by' => $user->id,
                    ])
                );
            }

            // 8c. Create 20 Customers (Manual)
            $customersData = [
                ['firstName' => 'John', 'lastName' => 'Doe', 'email' => 'john@cust.com', 'mobile' => '20001', 'address' => 'Customer St 1'],
                ['firstName' => 'Sarah', 'lastName' => 'Miller', 'email' => 'sarah@cust.com', 'mobile' => '20002', 'address' => 'Customer St 2'],
                ['firstName' => 'Michael', 'lastName' => 'Brown', 'email' => 'michael@cust.com', 'mobile' => '20003', 'address' => 'Customer St 3'],
                ['firstName' => 'Emily', 'lastName' => 'Davis', 'email' => 'emily@cust.com', 'mobile' => '20004', 'address' => 'Customer St 4'],
                ['firstName' => 'James', 'lastName' => 'Wilson', 'email' => 'james@cust.com', 'mobile' => '20005', 'address' => 'Customer St 5'],
                ['firstName' => 'Linda', 'lastName' => 'Garcia', 'email' => 'linda@cust.com', 'mobile' => '20006', 'address' => 'Customer St 6'],
                ['firstName' => 'Robert', 'lastName' => 'Martinez', 'email' => 'robert@cust.com', 'mobile' => '20007', 'address' => 'Customer St 7'],
                ['firstName' => 'Patricia', 'lastName' => 'Rodriguez', 'email' => 'patricia@cust.com', 'mobile' => '20008', 'address' => 'Customer St 8'],
                ['firstName' => 'Charles', 'lastName' => 'Hernandez', 'email' => 'charles@cust.com', 'mobile' => '20009', 'address' => 'Customer St 9'],
                ['firstName' => 'Barbara', 'lastName' => 'Lopez', 'email' => 'barbara@cust.com', 'mobile' => '20010', 'address' => 'Customer St 10'],
                ['firstName' => 'Matthew', 'lastName' => 'Gonzalez', 'email' => 'matthew@cust.com', 'mobile' => '20011', 'address' => 'Customer St 11'],
                ['firstName' => 'Jessica', 'lastName' => 'Wilson', 'email' => 'jessica@cust.com', 'mobile' => '20012', 'address' => 'Customer St 12'],
                ['firstName' => 'Daniel', 'lastName' => 'Anderson', 'email' => 'daniel@cust.com', 'mobile' => '20013', 'address' => 'Customer St 13'],
                ['firstName' => 'Karen', 'lastName' => 'Thomas', 'email' => 'karen@cust.com', 'mobile' => '20014', 'address' => 'Customer St 14'],
                ['firstName' => 'Mark', 'lastName' => 'Taylor', 'email' => 'mark@cust.com', 'mobile' => '20015', 'address' => 'Customer St 15'],
                ['firstName' => 'Nancy', 'lastName' => 'Moore', 'email' => 'nancy@cust.com', 'mobile' => '20016', 'address' => 'Customer St 16'],
                ['firstName' => 'Steven', 'lastName' => 'Jackson', 'email' => 'steven@cust.com', 'mobile' => '20017', 'address' => 'Customer St 17'],
                ['firstName' => 'Betty', 'lastName' => 'Martin', 'email' => 'betty@cust.com', 'mobile' => '20018', 'address' => 'Customer St 18'],
                ['firstName' => 'Paul', 'lastName' => 'Lee', 'email' => 'paul@cust.com', 'mobile' => '20019', 'address' => 'Customer St 19'],
                ['firstName' => 'Sandra', 'lastName' => 'Perez', 'email' => 'sandra@cust.com', 'mobile' => '20020', 'address' => 'Customer St 20'],
            ];

            foreach ($customersData as $c) {
                $customer = \App\Models\Customer::firstOrCreate(
                    ['email' => $c['email']],
                    [
                        'name' => $c['firstName'] . ' ' . $c['lastName'],
                        'email' => $c['email'],
                        'phone' => $c['mobile'],
                        'address' => $c['address'],
                        'vendor_id' => $vendor->id,
                        'created_by' => $user->id,
                        'updated_by' => $user->id,
                    ]
                );

                // Create initial store credit record
                \App\Models\CustomerStoreCredit::firstOrCreate(
                    ['customer_id' => $customer->id, 'vendor_id' => $vendor->id],
                    [
                        'current_balance' => rand(100, 1000),
                        'created_by' => $user->id,
                        'updated_by' => $user->id,
                    ]
                );
            }

            // 8d. Create 20 Promotions (Manual)
            $promotionsData = [
                ['name' => 'Summer Sale', 'type' => 'percentage', 'value' => 10, 'start_date' => '2026-01-01', 'end_date' => '2026-12-31'],
                ['name' => 'New Year Special', 'type' => 'fixed', 'value' => 50, 'start_date' => '2026-01-01', 'end_date' => '2026-01-10'],
                ['name' => 'Flash Deal', 'type' => 'percentage', 'value' => 20, 'start_date' => '2026-04-01', 'end_date' => '2026-04-30'],
                ['name' => 'Spring Discount', 'type' => 'percentage', 'value' => 15, 'start_date' => '2026-03-01', 'end_date' => '2026-05-31'],
                ['name' => 'Eid Offer', 'type' => 'fixed', 'value' => 100, 'start_date' => '2026-03-15', 'end_date' => '2026-04-15'],
                ['name' => 'Weekend Special', 'type' => 'percentage', 'value' => 5, 'start_date' => '2026-01-01', 'end_date' => '2026-12-31'],
                ['name' => 'Holiday Bonus', 'type' => 'fixed', 'value' => 200, 'start_date' => '2026-12-01', 'end_date' => '2026-12-31'],
                ['name' => 'Winter Clearance', 'type' => 'percentage', 'value' => 30, 'start_date' => '2026-11-01', 'end_date' => '2026-12-31'],
                ['name' => 'Back to School', 'type' => 'percentage', 'value' => 12, 'start_date' => '2026-08-01', 'end_date' => '2026-09-30'],
                ['name' => 'Cyber Monday', 'type' => 'percentage', 'value' => 25, 'start_date' => '2026-11-25', 'end_date' => '2026-12-05'],
                ['name' => 'Black Friday', 'type' => 'percentage', 'value' => 40, 'start_date' => '2026-11-20', 'end_date' => '2026-11-30'],
                ['name' => 'Valentine Special', 'type' => 'fixed', 'value' => 20, 'start_date' => '2026-02-10', 'end_date' => '2026-02-20'],
                ['name' => 'Easter Sale', 'type' => 'percentage', 'value' => 18, 'start_date' => '2026-04-01', 'end_date' => '2026-04-20'],
                ['name' => 'Mother Day', 'type' => 'fixed', 'value' => 30, 'start_date' => '2026-05-01', 'end_date' => '2026-05-15'],
                ['name' => 'Father Day', 'type' => 'fixed', 'value' => 35, 'start_date' => '2026-06-01', 'end_date' => '2026-06-20'],
                ['name' => 'Anniversary Sale', 'type' => 'percentage', 'value' => 50, 'start_date' => '2026-07-01', 'end_date' => '2026-07-31'],
                ['name' => 'Big Billion Days', 'type' => 'percentage', 'value' => 45, 'start_date' => '2026-10-01', 'end_date' => '2026-10-15'],
                ['name' => 'Amazon Prime Day', 'type' => 'percentage', 'value' => 35, 'start_date' => '2026-07-10', 'end_date' => '2026-07-20'],
                ['name' => 'Single Day', 'type' => 'percentage', 'value' => 11, 'start_date' => '2026-11-11', 'end_date' => '2026-11-11'],
                ['name' => 'Lucky Draw', 'type' => 'fixed', 'value' => 10, 'start_date' => '2026-01-01', 'end_date' => '2026-12-31'],
            ];

            foreach ($promotionsData as $p) {
                \App\Models\Promotion::updateOrCreate(
                    ['name' => $p['name'], 'vendor_id' => $vendor->id],
                    [
                        'name' => $p['name'],
                        'vendor_id' => $vendor->id,
                        'promotion_type' => 'standard',
                        'discount_type' => $p['type'] == 'percentage' ? 'percentage' : 'fixed_amount',
                        'discount_value' => $p['value'],
                        'applies_to' => 'entire_vendor',
                        'start_date' => $p['start_date'],
                        'end_date' => $p['end_date'],
                        'is_active' => true,
                        'created_by' => $user->id,
                        'updated_by' => $user->id,
                    ]
                );
            }

            // 8e. Create Expense Categories (Manual)
            $expenseCats = [
                ['name' => 'Utilities', 'vendor_id' => $vendor->id],
                ['name' => 'Rent', 'vendor_id' => $vendor->id],
                ['name' => 'Salaries', 'vendor_id' => $vendor->id],
                ['name' => 'Marketing', 'vendor_id' => $vendor->id],
                ['name' => 'Maintenance', 'vendor_id' => $vendor->id],
            ];

            $catModels = [];
            foreach ($expenseCats as $ec) {
                $catModels[] = \App\Models\ExpenseCategory::firstOrCreate(
                    ['name' => $ec['name'], 'vendor_id' => $vendor->id],
                    $ec
                );
            }

            // 8f. Create 20 Expenses (Manual)
            $expensesData = [
                ['title' => 'Electricity Bill', 'amount' => 150.00, 'branch_id' => 1, 'category_id' => $catModels[0]->id, 'date' => '2026-04-01'],
                ['title' => 'Water Bill', 'amount' => 50.00, 'branch_id' => 1, 'category_id' => $catModels[0]->id, 'date' => '2026-04-05'],
                ['title' => 'Office Rent', 'amount' => 2000.00, 'branch_id' => 1, 'category_id' => $catModels[1]->id, 'date' => '2026-04-01'],
                ['title' => 'Internet Subscription', 'amount' => 80.00, 'branch_id' => 1, 'category_id' => $catModels[0]->id, 'date' => '2026-04-10'],
                ['title' => 'Staff Salary - John', 'amount' => 3000.00, 'branch_id' => 1, 'category_id' => $catModels[2]->id, 'date' => '2026-04-25'],
                ['title' => 'Cleaning Supplies', 'amount' => 120.00, 'branch_id' => 1, 'category_id' => $catModels[4]->id, 'date' => '2026-04-12'],
                ['title' => 'Facebook Ads', 'amount' => 500.00, 'branch_id' => 1, 'category_id' => $catModels[3]->id, 'date' => '2026-04-15'],
                ['title' => 'Repair - Counter 1', 'amount' => 200.00, 'branch_id' => 1, 'category_id' => $catModels[4]->id, 'date' => '2026-04-18'],
                ['title' => 'Electricity - Branch 2', 'amount' => 130.00, 'branch_id' => 2, 'category_id' => $catModels[0]->id, 'date' => '2026-04-01'],
                ['title' => 'Rent - Branch 2', 'amount' => 1800.00, 'branch_id' => 2, 'category_id' => $catModels[1]->id, 'date' => '2026-04-01'],
                ['title' => 'Staff Salary - Jane', 'amount' => 3200.00, 'branch_id' => 2, 'category_id' => $catModels[2]->id, 'date' => '2026-04-25'],
                ['title' => 'New Coffee Machine', 'amount' => 450.00, 'branch_id' => 2, 'category_id' => $catModels[4]->id, 'date' => '2026-04-08'],
                ['title' => 'Google Ads', 'amount' => 300.00, 'branch_id' => 2, 'category_id' => $catModels[3]->id, 'date' => '2026-04-20'],
                ['title' => 'Stationery', 'amount' => 60.00, 'branch_id' => 2, 'category_id' => $catModels[4]->id, 'date' => '2026-04-14'],
                ['title' => 'Security Maintenance', 'amount' => 150.00, 'branch_id' => 2, 'category_id' => $catModels[4]->id, 'date' => '2026-04-22'],
                ['title' => 'Utility Deposit', 'amount' => 1000.00, 'branch_id' => 2, 'category_id' => $catModels[0]->id, 'date' => '2026-04-05'],
                ['title' => 'Local News Ad', 'amount' => 100.00, 'branch_id' => 1, 'category_id' => $catModels[3]->id, 'date' => '2026-04-18'],
                ['title' => 'Printer Ink', 'amount' => 85.00, 'branch_id' => 1, 'category_id' => $catModels[4]->id, 'date' => '2026-04-19'],
                ['title' => 'A/C Servicing', 'amount' => 300.00, 'branch_id' => 1, 'category_id' => $catModels[4]->id, 'date' => '2026-04-20'],
                ['title' => 'Insurance Premium', 'amount' => 1200.00, 'branch_id' => 1, 'category_id' => $catModels[4]->id, 'date' => '2026-04-01'],
            ];

            foreach ($expensesData as $e) {
                \App\Models\Expense::create([
                    'amount' => $e['amount'],
                    'branch_id' => $e['branch_id'],
                    'expense_category_id' => $e['category_id'],
                    'expense_date' => $e['date'],
                    'description' => $e['title'],
                    'vendor_id' => $vendor->id,
                    'created_by' => $user->id,
                    'updated_by' => $user->id,
                ]);
            }

            // 9. Create 20 Sample Products
            $sampleProducts = [
                // Electronics (Category ID: 1)
                ['name' => 'iPhone 15 Pro', 'category_id' => 1, 'price' => 999.99, 'cost' => 700.00, 'unit_id' => 1],
                ['name' => 'Samsung Galaxy S24', 'category_id' => 1, 'price' => 899.99, 'cost' => 600.00, 'unit_id' => 1],
                ['name' => 'Sony WH-1000XM5', 'category_id' => 1, 'price' => 349.99, 'cost' => 200.00, 'unit_id' => 1],
                ['name' => 'MacBook Air M3', 'category_id' => 1, 'price' => 1099.00, 'cost' => 800.00, 'unit_id' => 1],
                ['name' => 'Dell XPS 13', 'category_id' => 1, 'price' => 999.00, 'cost' => 750.00, 'unit_id' => 1],

                // Clothing (Category ID: 2)
                ['name' => 'Levi\'s 501 Jeans', 'category_id' => 2, 'price' => 69.50, 'cost' => 30.00, 'unit_id' => 1],
                ['name' => 'Nike Air Max', 'category_id' => 2, 'price' => 120.00, 'cost' => 50.00, 'unit_id' => 1],
                ['name' => 'Ralph Lauren Polo', 'category_id' => 2, 'price' => 85.00, 'cost' => 35.00, 'unit_id' => 1],
                ['name' => 'Adidas Hoodie', 'category_id' => 2, 'price' => 55.00, 'cost' => 20.00, 'unit_id' => 1],
                ['name' => 'Uniqlo T-Shirt', 'category_id' => 2, 'price' => 14.90, 'cost' => 5.00, 'unit_id' => 1],

                // Groceries (Category ID: 3)
                ['name' => 'Whole Milk', 'category_id' => 3, 'price' => 3.50, 'cost' => 2.00, 'unit_id' => 15],
                ['name' => 'Organic Eggs (12pk)', 'category_id' => 3, 'price' => 5.99, 'cost' => 3.50, 'unit_id' => 1],
                ['name' => 'Large Avocado', 'category_id' => 3, 'price' => 1.50, 'cost' => 0.75, 'unit_id' => 1],
                ['name' => 'Premium Coffee Beans', 'category_id' => 3, 'price' => 15.00, 'cost' => 8.00, 'unit_id' => 9],
                ['name' => 'Cheddar Cheese', 'category_id' => 3, 'price' => 7.50, 'cost' => 4.00, 'unit_id' => 9],

                // Books (Category ID: 4)
                ['name' => 'The Great Gatsby', 'category_id' => 4, 'price' => 12.99, 'cost' => 6.00, 'unit_id' => 1],
                ['name' => 'To Kill a Mockingbird', 'category_id' => 4, 'price' => 14.50, 'cost' => 7.00, 'unit_id' => 1],
                ['name' => '1984', 'category_id' => 4, 'price' => 11.00, 'cost' => 5.50, 'unit_id' => 1],
                ['name' => 'Atomic Habits', 'category_id' => 4, 'price' => 18.00, 'cost' => 10.00, 'unit_id' => 1],
                ['name' => 'Thinking, Fast and Slow', 'category_id' => 4, 'price' => 22.00, 'cost' => 12.00, 'unit_id' => 1],
            ];

            foreach ($sampleProducts as $index => $p) {
                // Create Product
                $product = Product::firstOrCreate(
                    ['name' => $p['name'], 'vendor_id' => $vendor->id],
                    [
                        'description' => 'Description for ' . $p['name'],
                        'category_id' => $p['category_id'],
                        'unit_of_measure_id' => $p['unit_id'],
                        'created_by' => $user->id,
                        'updated_by' => $user->id,
                    ]
                );

                // Define variants for this product
                $variantsData = [['name' => 'Standard', 'value' => 'Default']];

                if ($p['category_id'] == 1) { // Electronics
                    $variantsData = [
                        ['name' => 'Storage', 'value' => '128GB'],
                        ['name' => 'Storage', 'value' => '256GB'],
                    ];
                } elseif ($p['category_id'] == 2) { // Clothing
                    $variantsData = [
                        ['name' => 'Size', 'value' => 'Medium'],
                        ['name' => 'Size', 'value' => 'Large'],
                    ];
                }

                foreach ($variantsData as $vData) {
                    $variant = Variant::firstOrCreate(
                        ['product_id' => $product->id, 'name' => $vData['name'], 'value' => $vData['value']],
                        [
                            'sku' => strtoupper(substr($p['name'], 0, 3)) . '-' . strtoupper(substr($vData['value'], 0, 2)) . '-' . rand(1000, 9999),
                            'barcode' => rand(100000000000, 999999999999),
                            'created_by' => $user->id,
                            'updated_by' => $user->id,
                        ]
                    );

                    // Get unit info for ProductStock
                    $unit = UnitOfMeasure::find($p['unit_id']);

                    // Assign to both branches with multiple stock batches
                    foreach ([$branch1->id, $branch2->id] as $branchId) {
                        $branchProduct = BranchProduct::firstOrCreate(
                            ['branch_id' => $branchId, 'product_id' => $product->id, 'variant_id' => $variant->id],
                            [
                                'is_active' => true,
                                'created_by' => $user->id,
                                'updated_by' => $user->id,
                            ]
                        );

                        // Create Batch 1
                        ProductStock::create([
                            'branch_id' => $branchId,
                            'product_id' => $product->id,
                            'variant_id' => $variant->id,
                            'branch_product_id' => $branchProduct->id,
                            'unit_of_measure_name' => $unit->name,
                            'unit_of_measure_abbreviation' => $unit->abbreviation,
                            'quantity' => rand(50, 100),
                            'cost_price' => $p['cost'],
                            'selling_price' => $p['price'],
                            'expiry_date' => now()->addMonths(rand(6, 24))->toDateString(),
                        ]);

                        // Create Batch 2 (Different Price)
                        ProductStock::create([
                            'branch_id' => $branchId,
                            'product_id' => $product->id,
                            'variant_id' => $variant->id,
                            'branch_product_id' => $branchProduct->id,
                            'unit_of_measure_name' => $unit->name,
                            'unit_of_measure_abbreviation' => $unit->abbreviation,
                            'quantity' => rand(20, 50),
                            'cost_price' => $p['cost'] * 1.1, // 10% more expensive batch
                            'selling_price' => $p['price'] * 1.05,
                            'expiry_date' => now()->addMonths(rand(25, 48))->toDateString(),
                        ]);
                    }
                }
            }

            // 10. Create 20 Purchase Orders (Manual)
            $allSuppliers = \App\Models\Supplier::all();
            $allProducts = \App\Models\Product::all();
            $allVariants = \App\Models\Variant::all();

            $poData = [
                ['supplier_id' => $allSuppliers[0]->id, 'branch_id' => 1, 'status' => 'ordered', 'total_amount' => 5000],
                ['supplier_id' => $allSuppliers[1]->id, 'branch_id' => 1, 'status' => 'fully_received', 'total_amount' => 1200],
                ['supplier_id' => $allSuppliers[2]->id, 'branch_id' => 2, 'status' => 'ordered', 'total_amount' => 3000],
                ['supplier_id' => $allSuppliers[3]->id, 'branch_id' => 2, 'status' => 'fully_received', 'total_amount' => 4500],
                ['supplier_id' => $allSuppliers[4]->id, 'branch_id' => 1, 'status' => 'ordered', 'total_amount' => 2200],
                ['supplier_id' => $allSuppliers[5]->id, 'branch_id' => 1, 'status' => 'fully_received', 'total_amount' => 1500],
                ['supplier_id' => $allSuppliers[6]->id, 'branch_id' => 2, 'status' => 'ordered', 'total_amount' => 800],
                ['supplier_id' => $allSuppliers[7]->id, 'branch_id' => 2, 'status' => 'fully_received', 'total_amount' => 6000],
                ['supplier_id' => $allSuppliers[8]->id, 'branch_id' => 1, 'status' => 'ordered', 'total_amount' => 3300],
                ['supplier_id' => $allSuppliers[9]->id, 'branch_id' => 1, 'status' => 'fully_received', 'total_amount' => 2700],
                ['supplier_id' => $allSuppliers[10]->id, 'branch_id' => 2, 'status' => 'ordered', 'total_amount' => 4100],
                ['supplier_id' => $allSuppliers[11]->id, 'branch_id' => 2, 'status' => 'fully_received', 'total_amount' => 1900],
                ['supplier_id' => $allSuppliers[12]->id, 'branch_id' => 1, 'status' => 'ordered', 'total_amount' => 5500],
                ['supplier_id' => $allSuppliers[13]->id, 'branch_id' => 1, 'status' => 'fully_received', 'total_amount' => 3200],
                ['supplier_id' => $allSuppliers[14]->id, 'branch_id' => 2, 'status' => 'ordered', 'total_amount' => 2400],
                ['supplier_id' => $allSuppliers[15]->id, 'branch_id' => 2, 'status' => 'fully_received', 'total_amount' => 7000],
                ['supplier_id' => $allSuppliers[16]->id, 'branch_id' => 1, 'status' => 'ordered', 'total_amount' => 4800],
                ['supplier_id' => $allSuppliers[17]->id, 'branch_id' => 1, 'status' => 'fully_received', 'total_amount' => 1100],
                ['supplier_id' => $allSuppliers[18]->id, 'branch_id' => 2, 'status' => 'ordered', 'total_amount' => 3600],
                ['supplier_id' => $allSuppliers[19]->id, 'branch_id' => 2, 'status' => 'fully_received', 'total_amount' => 5200],
            ];

            foreach ($poData as $p) {
                $po = \App\Models\PurchaseOrder::create(array_merge($p, [
                    'vendor_id' => $vendor->id,
                    'created_by' => $user->id,
                    'updated_by' => $user->id,
                    'order_date' => now()->subDays(rand(1, 30)),
                    'paid_amount' => $p['status'] == 'fully_received' ? $p['total_amount'] : 0,
                ]));

                // Add 1 item per PO
                \App\Models\PurchaseOrderItem::create([
                    'purchase_order_id' => $po->id,
                    'variant_id' => $allVariants[0]->id,
                    'unit_of_measure_id' => 1,
                    'quantity_ordered' => 10,
                    'quantity_received' => $p['status'] == 'fully_received' ? 10 : 0,
                    'unit_cost' => $p['total_amount'] / 10,
                    'total_cost' => $p['total_amount'],
                ]);
            }

            // 11. Create 1 Stock Transfer (Request)
            $transferData = [
                ['from_branch_id' => $branch1->id, 'to_branch_id' => $branch2->id, 'status' => 'requested'],
            ];

            foreach ($transferData as $t) {
                $transfer = \App\Models\StockTransfer::create(array_merge($t, [
                    'vendor_id' => $vendor->id,
                    'created_by' => $user->id,
                    'updated_by' => $user->id,
                    'notes' => "Bulk request for testing",
                ]));

                $itemStatus = $t['status'];
                if ($itemStatus === 'pending_approval') $itemStatus = 'pending';
                
                // Add first 5 variants to this transfer
                foreach (range(0, 4) as $idx) {
                    \App\Models\StockTransferItem::create([
                        'stock_transfer_id' => $transfer->id,
                        'variant_id' => $allVariants[$idx]->id,
                        'product_stocks_id' => ($itemStatus === 'requested') ? null : (\App\Models\ProductStock::where('branch_id', $transfer->from_branch_id)->where('variant_id', $allVariants[$idx]->id)->first()?->id),
                        'unit_of_measure_id' => 1,
                        'quantity' => 5 + $idx,
                        'status' => $itemStatus,
                    ]);
                }
            }

            // 12. Create 20 Inventory Adjustments (Manual)
            $adjustmentData = [
                ['branch_id' => 1, 'reason' => 'damage', 'notes' => 'Dropped item'],
                ['branch_id' => 1, 'reason' => 'loss', 'notes' => 'Missing during count'],
                ['branch_id' => 1, 'reason' => 'correction', 'notes' => 'Wrong entry correction'],
                ['branch_id' => 2, 'reason' => 'damage', 'notes' => 'Water damage'],
                ['branch_id' => 2, 'reason' => 'loss', 'notes' => 'Theft suspected'],
                ['branch_id' => 2, 'reason' => 'correction', 'notes' => 'Audit correction'],
                ['branch_id' => 1, 'reason' => 'damage', 'notes' => 'Packaging torn'],
                ['branch_id' => 1, 'reason' => 'loss', 'notes' => 'Inventory shrink'],
                ['branch_id' => 1, 'reason' => 'correction', 'notes' => 'Manual adjustment'],
                ['branch_id' => 2, 'reason' => 'damage', 'notes' => 'Broken seal'],
                ['branch_id' => 2, 'reason' => 'loss', 'notes' => 'Expelled'],
                ['branch_id' => 2, 'reason' => 'correction', 'notes' => 'System error fix'],
                ['branch_id' => 1, 'reason' => 'damage', 'notes' => 'Dented'],
                ['branch_id' => 1, 'reason' => 'loss', 'notes' => 'Not found'],
                ['branch_id' => 1, 'reason' => 'correction', 'notes' => 'Recounted'],
                ['branch_id' => 2, 'reason' => 'damage', 'notes' => 'Faulty unit'],
                ['branch_id' => 2, 'reason' => 'loss', 'notes' => 'Lost in transit'],
                ['branch_id' => 2, 'reason' => 'correction', 'notes' => 'Balance fix'],
                ['branch_id' => 1, 'reason' => 'damage', 'notes' => 'Old stock'],
                ['branch_id' => 2, 'reason' => 'loss', 'notes' => 'Stock out'],
            ];

            foreach ($adjustmentData as $a) {
                $adj = \App\Models\InventoryAdjustment::create([
                    'branch_id' => $a['branch_id'],
                    'reason' => $a['reason'],
                    'vendor_id' => $vendor->id,
                    'variant_id' => $allVariants[2]->id,
                    'quantity' => 2,
                    'type' => 'subtraction',
                    'created_by' => $user->id,
                ]);
            }

            // 13. Create 20 Cash Register Sessions (Manual)
            $allCounters = \App\Models\BillingCounter::all();
            $sessionData = [
                ['billing_counter_id' => $allCounters[0]->id, 'status' => 'closed', 'opening_balance' => 100, 'closing_balance' => 1100],
                ['billing_counter_id' => $allCounters[0]->id, 'status' => 'closed', 'opening_balance' => 100, 'closing_balance' => 1200],
                ['billing_counter_id' => $allCounters[1]->id, 'status' => 'closed', 'opening_balance' => 100, 'closing_balance' => 1300],
                ['billing_counter_id' => $allCounters[1]->id, 'status' => 'closed', 'opening_balance' => 100, 'closing_balance' => 1400],
                ['billing_counter_id' => $allCounters[2]->id, 'status' => 'closed', 'opening_balance' => 100, 'closing_balance' => 1500],
                ['billing_counter_id' => $allCounters[2]->id, 'status' => 'closed', 'opening_balance' => 100, 'closing_balance' => 1600],
                ['billing_counter_id' => $allCounters[0]->id, 'status' => 'closed', 'opening_balance' => 100, 'closing_balance' => 1700],
                ['billing_counter_id' => $allCounters[0]->id, 'status' => 'closed', 'opening_balance' => 100, 'closing_balance' => 1800],
                ['billing_counter_id' => $allCounters[1]->id, 'status' => 'closed', 'opening_balance' => 100, 'closing_balance' => 1900],
                ['billing_counter_id' => $allCounters[1]->id, 'status' => 'closed', 'opening_balance' => 100, 'closing_balance' => 2000],
                ['billing_counter_id' => $allCounters[2]->id, 'status' => 'closed', 'opening_balance' => 100, 'closing_balance' => 2100],
                ['billing_counter_id' => $allCounters[2]->id, 'status' => 'closed', 'opening_balance' => 100, 'closing_balance' => 2200],
                ['billing_counter_id' => $allCounters[0]->id, 'status' => 'closed', 'opening_balance' => 100, 'closing_balance' => 2300],
                ['billing_counter_id' => $allCounters[0]->id, 'status' => 'closed', 'opening_balance' => 100, 'closing_balance' => 2400],
                ['billing_counter_id' => $allCounters[1]->id, 'status' => 'closed', 'opening_balance' => 100, 'closing_balance' => 2500],
                ['billing_counter_id' => $allCounters[1]->id, 'status' => 'closed', 'opening_balance' => 100, 'closing_balance' => 2600],
                ['billing_counter_id' => $allCounters[2]->id, 'status' => 'closed', 'opening_balance' => 100, 'closing_balance' => 2700],
                ['billing_counter_id' => $allCounters[2]->id, 'status' => 'closed', 'opening_balance' => 100, 'closing_balance' => 2800],
                ['billing_counter_id' => $allCounters[0]->id, 'status' => 'closed', 'opening_balance' => 100, 'closing_balance' => 2900],
                ['billing_counter_id' => $allCounters[0]->id, 'status' => 'open', 'opening_balance' => 100],
            ];

            $allPaymentMethods = \App\Models\PaymentMethod::where('vendor_id', $vendor->id)->get();
            $branchSessions = [];
            foreach ($sessionData as $s) {
                $session = \App\Models\CashRegisterSession::create([
                    'billing_counter_id' => $s['billing_counter_id'],
                    'status' => $s['status'],
                    'opening_balance' => $s['opening_balance'],
                    'closing_balance' => isset($s['closing_balance']) ? $s['closing_balance'] : null,
                    'user_id' => $user->id,
                    'started_at' => now()->subDays(20 - count($sessionData)),
                    'ended_at' => $s['status'] == 'closed' ? now()->subDays(20 - count($sessionData))->addHours(8) : null,
                ]);

                $bc = \App\Models\BillingCounter::find($session->billing_counter_id);
                $branchSessions[$bc->branch_id] = $session->id;

                // Add 1 transaction per session
                \App\Models\CashTransaction::create([
                    'payment_method_id' => $allPaymentMethods->first()->id,
                    'cash_register_session_id' => $session->id,
                    'type' => 'cash_in',
                    'amount' => 50,
                    'notes' => 'Testing',
                    'created_by' => $user->id,
                ]);
            }

            // 14. Create 25 Sales (Manual)
            $allCustomers = \App\Models\Customer::all();
            $allUsers = \App\Models\User::all();

            $salesData = [
                ['customer_id' => $allCustomers[0]->id, 'branch_id' => 1, 'subtotal' => 1000, 'total_amount' => 1050, 'user_id' => $allUsers[0]->id],
                ['customer_id' => $allCustomers[1]->id, 'branch_id' => 1, 'subtotal' => 200, 'total_amount' => 210, 'user_id' => $allUsers[1]->id],
                ['customer_id' => $allCustomers[2]->id, 'branch_id' => 2, 'subtotal' => 500, 'total_amount' => 525, 'user_id' => $allUsers[2]->id],
                ['customer_id' => $allCustomers[3]->id, 'branch_id' => 2, 'subtotal' => 1500, 'total_amount' => 1575, 'user_id' => $allUsers[3]->id],
                ['customer_id' => null, 'branch_id' => 1, 'subtotal' => 50, 'total_amount' => 52.5, 'user_id' => $allUsers[0]->id],
                ['customer_id' => $allCustomers[4]->id, 'branch_id' => 1, 'subtotal' => 300, 'total_amount' => 315, 'user_id' => $allUsers[1]->id],
                ['customer_id' => $allCustomers[5]->id, 'branch_id' => 2, 'subtotal' => 700, 'total_amount' => 735, 'user_id' => $allUsers[2]->id],
                ['customer_id' => $allCustomers[6]->id, 'branch_id' => 2, 'subtotal' => 1200, 'total_amount' => 1260, 'user_id' => $allUsers[3]->id],
                ['customer_id' => null, 'branch_id' => 1, 'subtotal' => 80, 'total_amount' => 84, 'user_id' => $allUsers[0]->id],
                ['customer_id' => $allCustomers[7]->id, 'branch_id' => 1, 'subtotal' => 250, 'total_amount' => 262.5, 'user_id' => $allUsers[1]->id],
                ['customer_id' => $allCustomers[8]->id, 'branch_id' => 2, 'subtotal' => 450, 'total_amount' => 472.5, 'user_id' => $allUsers[2]->id],
                ['customer_id' => $allCustomers[9]->id, 'branch_id' => 2, 'subtotal' => 900, 'total_amount' => 945, 'user_id' => $allUsers[3]->id],
                ['customer_id' => null, 'branch_id' => 1, 'subtotal' => 120, 'total_amount' => 126, 'user_id' => $allUsers[0]->id],
                ['customer_id' => $allCustomers[10]->id, 'branch_id' => 1, 'subtotal' => 600, 'total_amount' => 630, 'user_id' => $allUsers[1]->id],
                ['customer_id' => $allCustomers[11]->id, 'branch_id' => 2, 'subtotal' => 1100, 'total_amount' => 1155, 'user_id' => $allUsers[2]->id],
                ['customer_id' => $allCustomers[12]->id, 'branch_id' => 2, 'subtotal' => 1400, 'total_amount' => 1470, 'user_id' => $allUsers[3]->id],
                ['customer_id' => null, 'branch_id' => 1, 'subtotal' => 200, 'total_amount' => 210, 'user_id' => $allUsers[0]->id],
                ['customer_id' => $allCustomers[13]->id, 'branch_id' => 1, 'subtotal' => 350, 'total_amount' => 367.5, 'user_id' => $allUsers[1]->id],
                ['customer_id' => $allCustomers[14]->id, 'branch_id' => 2, 'subtotal' => 550, 'total_amount' => 577.5, 'user_id' => $allUsers[2]->id],
                ['customer_id' => $allCustomers[15]->id, 'branch_id' => 2, 'subtotal' => 850, 'total_amount' => 892.5, 'user_id' => $allUsers[3]->id],
                ['customer_id' => null, 'branch_id' => 1, 'subtotal' => 300, 'total_amount' => 315, 'user_id' => $allUsers[0]->id],
                ['customer_id' => $allCustomers[16]->id, 'branch_id' => 1, 'subtotal' => 400, 'total_amount' => 420, 'user_id' => $allUsers[1]->id],
                ['customer_id' => $allCustomers[17]->id, 'branch_id' => 2, 'subtotal' => 650, 'total_amount' => 682.5, 'user_id' => $allUsers[2]->id],
                ['customer_id' => $allCustomers[18]->id, 'branch_id' => 2, 'subtotal' => 950, 'total_amount' => 997.5, 'user_id' => $allUsers[3]->id],
                ['customer_id' => $allCustomers[19]->id, 'branch_id' => 1, 'subtotal' => 100, 'total_amount' => 105, 'user_id' => $allUsers[0]->id],
            ];

            $allSessions = \App\Models\CashRegisterSession::all();
            foreach ($salesData as $index => $s) {
                $sale = \App\Models\Sale::create([
                    'vendor_id' => $vendor->id,
                    'branch_id' => $s['branch_id'],
                    'sales_person_id' => $s['user_id'],
                    'cash_register_session_id' => $branchSessions[$s['branch_id']],
                    'customer_id' => $s['customer_id'],
                    'subtotal_amount' => $s['subtotal'],
                    'final_amount' => $s['total_amount'],
                    'tax_amount' => $s['total_amount'] - $s['subtotal'],
                    'status' => 'completed',
                    'created_by' => $user->id,
                    'updated_by' => $user->id,
                    'created_at' => now()->subDays(25 - $index),
                ]);

                // Add item
                \App\Models\SaleItem::create([
                    'sale_id' => $sale->id,
                    'variant_id' => $allVariants[$index % 20]->id,
                    'product_stock_id' => 1,
                    'quantity' => 1,
                    'buy_price' => \App\Models\ProductStock::where('variant_id', $allVariants[$index % 20]->id)->first()->cost_price,
                    'sell_price_at_sale' => $s['subtotal'],
                    'line_total' => $s['subtotal'],
                ]);

                // Add payment
                \App\Models\SalePayment::create([
                    'sale_id' => $sale->id,
                    'cash_register_session_id' => $sale->cash_register_session_id,
                    'payment_method_id' => $allPaymentMethods->random()->id,
                    'amount' => $s['total_amount'],
                    'amount_received' => $s['total_amount'],
                    'change' => 0,
                    'created_by' => $user->id,
                ]);
            }

            // 15. Create 20 Sale Returns (Manual)
            $allSales = \App\Models\Sale::all();
            $returnData = [
                ['sale_id' => $allSales[0]->id, 'return_amount' => 1050, 'reason' => 'Defective'],
                ['sale_id' => $allSales[1]->id, 'return_amount' => 210, 'reason' => 'Wrong size'],
                ['sale_id' => $allSales[2]->id, 'return_amount' => 525, 'reason' => 'Customer changed mind'],
                ['sale_id' => $allSales[3]->id, 'return_amount' => 1575, 'reason' => 'Damaged'],
                ['sale_id' => $allSales[4]->id, 'return_amount' => 52.5, 'reason' => 'Not as described'],
                ['sale_id' => $allSales[5]->id, 'return_amount' => 315, 'reason' => 'Late delivery'],
                ['sale_id' => $allSales[6]->id, 'return_amount' => 735, 'reason' => 'Poor quality'],
                ['sale_id' => $allSales[7]->id, 'return_amount' => 1260, 'reason' => 'Wrong item'],
                ['sale_id' => $allSales[8]->id, 'return_amount' => 84, 'reason' => 'Defective'],
                ['sale_id' => $allSales[9]->id, 'return_amount' => 262.5, 'reason' => 'Wrong size'],
                ['sale_id' => $allSales[10]->id, 'return_amount' => 472.5, 'reason' => 'Damaged'],
                ['sale_id' => $allSales[11]->id, 'return_amount' => 945, 'reason' => 'Not as described'],
                ['sale_id' => $allSales[12]->id, 'return_amount' => 126, 'reason' => 'Late delivery'],
                ['sale_id' => $allSales[13]->id, 'return_amount' => 630, 'reason' => 'Poor quality'],
                ['sale_id' => $allSales[14]->id, 'return_amount' => 1155, 'reason' => 'Wrong item'],
                ['sale_id' => $allSales[15]->id, 'return_amount' => 1470, 'reason' => 'Defective'],
                ['sale_id' => $allSales[16]->id, 'return_amount' => 210, 'reason' => 'Wrong size'],
                ['sale_id' => $allSales[17]->id, 'return_amount' => 367.5, 'reason' => 'Damaged'],
                ['sale_id' => $allSales[18]->id, 'return_amount' => 577.5, 'reason' => 'Not as described'],
                ['sale_id' => $allSales[19]->id, 'return_amount' => 892.5, 'reason' => 'Late delivery'],
            ];

            foreach ($returnData as $r) {
                $sale = \App\Models\Sale::find($r['sale_id']);
                $ret = \App\Models\SaleReturn::create([
                    'vendor_id' => $vendor->id,
                    'branch_id' => $sale->branch_id,
                    'original_sale_id' => $sale->id,
                    'reason' => $r['reason'],
                    'refund_amount' => $r['return_amount'],
                    'refund_type' => 'cash_back',
                    'created_by' => $user->id,
                    'updated_by' => $user->id,
                ]);

                // Add item to return
                $saleItem = $sale->saleItems()->first();
                \App\Models\ReturnItem::create([
                    'return_id' => $ret->id,
                    'sale_item_id' => $saleItem->id,
                    'quantity' => $saleItem->quantity,
                ]);
            }
        });
    }
}
