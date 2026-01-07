<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            VendorSeeder::class,
            UserSeeder::class,
            RoleSeeder::class,
            BranchSeeder::class,
            BillingCounterSeeder::class,
            CashRegisterSessionSeeder::class,
            CategorySeeder::class,
            CustomerSeeder::class,
            CustomerStoreCreditSeeder::class,
            ExpenseCategorySeeder::class,
            ExpenseSeeder::class,
            UnitOfMeasureSeeder::class,
            ProductSeeder::class,
            VariantSeeder::class,
            SupplierSeeder::class,
            TaxSeeder::class,
            PromotionSeeder::class,
            PurchaseOrderSeeder::class,
            SaleSeeder::class,
            StockTransferSeeder::class,
            MembershipSeeder::class,
            UserBranchAssignmentSeeder::class,
            PaymentMethodSeeder::class,
            ReceiptSettingsSeeder::class,
            SaleReturnSeeder::class,
        ]);
    }
}
