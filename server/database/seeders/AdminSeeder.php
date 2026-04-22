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
                        'is_active' => true,
                        'created_by' => $user->id,
                        'updated_by' => $user->id,
                    ]
                );
            }

            // 8. Create Payment Methods
            $paymentMethods = [
                ['name' => 'Cash', 'is_active' => true],
                ['name' => 'Card', 'is_active' => true],
                ['name' => 'Bank Transfer', 'is_active' => true],
                ['name' => 'Mobile Money', 'is_active' => true],
            ];

            foreach ($paymentMethods as $pm) {
                PaymentMethod::firstOrCreate(
                    ['vendor_id' => $vendor->id, 'name' => $pm['name']],
                    [
                        'is_active' => $pm['is_active'],
                        'created_by' => $user->id,
                        'updated_by' => $user->id,
                    ]
                );
            }

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
                $variantsData = [['name' => 'Default', 'value' => 'Default']];
                
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
                                'low_stock_threshold' => 10,
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
        });
    }
}
