<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BillingCounterController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\BranchProductController;
use App\Http\Controllers\CashRegisterSessionController;
use App\Http\Controllers\CashTransactionController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CustomerStoreCreditController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpenseCategoryController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\InventoryAdjustmentController;
use App\Http\Controllers\MembershipController;
use App\Http\Controllers\OtpController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PromotionController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\ReceiptSettingsController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\SaleReturnController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\StockTransferController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\TaxController;
use App\Http\Controllers\UnitOfMeasureController;
use App\Http\Controllers\UserBranchAssignmentController;
use App\Http\Controllers\VariantController;
use App\Http\Controllers\VendorController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/
Route::middleware('log.api')->group(function () {
    // Not currently used in the frontend (WordPress plugin integration)
    Route::get('update-checker', function () {
        return response()->json([
                "name" => "Campaignbay Pro",
                'version' => '1.0.1',
                'download_url' => 'https://wpanchorbay.com/plugins/campaignbay/',
                'sections' => [
                    'description' => 'The description HTML.',
                    'changelog' => '<ul><li>Fixed a bug.</li></ul>',
                ],
        ]);
    });

    // Public authentication routes
    Route::prefix('auth')->group(function () {
        // Used in: lib/hooks/useAuth.tsx
        Route::post('login', [AuthController::class, 'login']);
        // Used in: lib/hooks/useAuth.tsx
        Route::post('register', [AuthController::class, 'register']);
        // Used in: app/(auth)/forgot-password/page.tsx
        Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
        // Used in: app/(auth)/reset-password/page.tsx
        Route::post('reset-password', [AuthController::class, 'resetPassword']);
    });

    Route::middleware(['auth:api', 'user.permissions'])->group(function () {
        // Protected authentication routes
        Route::prefix('auth')->group(function () {
            // Used in: lib/hooks/useAuth.tsx
            Route::post('logout', [AuthController::class, 'logout']);
            // Handled automatically by axios interceptor in lib/api.ts
            Route::post('refresh', [AuthController::class, 'refresh']);
            // Used in: lib/hooks/useAuth.tsx
            Route::get('me', [AuthController::class, 'userProfile']);
        });

        // Used in: components/navbar.tsx
        Route::get('global-search', [SearchController::class, 'globalSearch']);

        Route::prefix('otp')->group(function () {
            // Used in: app/(otp)/verify/page.tsx
            Route::post('send', [OtpController::class, 'send']);
            // Used in: app/(otp)/verify/page.tsx
            Route::post('verify', [OtpController::class, 'verify']);
        });

        // Vendor routes (protected)
        Route::prefix('vendors')->group(function () {
            // Used in: app/pos/onboarding/page.tsx, app/pos/vendor/add/page.tsx
            Route::post('/', [VendorController::class, 'store']);
            // Used in: app/pos/vendor/[vendorId]/settings/page.tsx, lib/contexts/VendorContext.tsx
            Route::get('/', [VendorController::class, 'index']);
            Route::middleware('vendor.scope')->group(function () {
                // Used in: app/pos/vendor/[vendorId]/settings/page.tsx, lib/contexts/VendorContext.tsx
                Route::get('/{vendor_id}', [VendorController::class, 'show']);
                // Used in: app/pos/vendor/[vendorId]/settings/page.tsx
                Route::put('/{vendor_id}/settings', [VendorController::class, 'updateSettings'])->middleware('permission:can_edit_organization_settings');
            });
        });

        // Category routes (protected)
        Route::prefix('categories')->group(function () {
            // Used in: app/pos/vendor/[vendorId]/pos/page.tsx, app/pos/vendor/[vendorId]/products/_components/ProductForm.tsx, app/pos/vendor/[vendorId]/products/categories/_components/CategoryForm.tsx, app/pos/vendor/[vendorId]/products/categories/page.tsx, app/pos/vendor/[vendorId]/promotions/_components/PromotionForm.tsx
            Route::get('/', [CategoryController::class, 'index'])->middleware('permission:can_view_catalog');
            // Used in: app/pos/vendor/[vendorId]/products/categories/_components/CategoryForm.tsx
            Route::post('/', [CategoryController::class, 'store'])->middleware('permission:can_manage_catalog');
            // Used in: app/pos/vendor/[vendorId]/pos/page.tsx, app/pos/vendor/[vendorId]/products/_components/ProductForm.tsx, app/pos/vendor/[vendorId]/products/categories/_components/CategoryForm.tsx, app/pos/vendor/[vendorId]/products/categories/page.tsx, app/pos/vendor/[vendorId]/promotions/_components/PromotionForm.tsx
            Route::get('/{category}', [CategoryController::class, 'show'])->middleware('permission:can_view_catalog');
            // Used in: app/pos/vendor/[vendorId]/products/categories/_components/CategoryForm.tsx
            Route::put('/{category}', [CategoryController::class, 'update'])->middleware('permission:can_manage_catalog');
            // Used in: app/pos/vendor/[vendorId]/products/categories/page.tsx
            Route::delete('/{category}', [CategoryController::class, 'destroy'])->middleware('permission:can_delete_catalog');
        });

        // Product routes (protected)
        Route::prefix('products')->group(function () {
            // Used in: app/pos/vendor/[vendorId]/products/page.tsx
            Route::post('/bulk-delete', [ProductController::class, 'bulkDelete'])->middleware('permission:can_delete_catalog');
            // Not currently used in the frontend
            Route::get('/export', [ProductController::class, 'export'])->middleware('permission:can_manage_catalog');
            // Not currently used in the frontend
            Route::post('/import', [ProductController::class, 'import'])->middleware('permission:can_manage_catalog');
        });
        // Used in: app/pos/vendor/[vendorId]/products/[productId]/page.tsx, app/pos/vendor/[vendorId]/products/_components/ProductForm.tsx, app/pos/vendor/[vendorId]/products/page.tsx, app/pos/vendor/[vendorId]/promotions/_components/PromotionForm.tsx
        Route::apiResource('products', ProductController::class)->middleware(['permission:can_view_catalog']);

        // Variant routes (protected)
        Route::prefix('variants')->middleware('permission:can_manage_catalog')->group(function () {
            // Used in: app/pos/vendor/[vendorId]/inventory/adjustments/_components/InventoryAdjustmentForm.tsx, app/pos/vendor/[vendorId]/inventory/transfers/_components/StockTransferForm.tsx, app/pos/vendor/[vendorId]/procurement/orders/_components/PurchaseOrderForm.tsx
            Route::get('/', [VariantController::class, 'index']);
            // Used in: app/pos/vendor/[vendorId]/products/_components/ProductForm.tsx
            Route::post('/', [VariantController::class, 'store']);
            // Used in: app/pos/vendor/[vendorId]/inventory/adjustments/_components/InventoryAdjustmentForm.tsx, app/pos/vendor/[vendorId]/inventory/transfers/_components/StockTransferForm.tsx, app/pos/vendor/[vendorId]/procurement/orders/_components/PurchaseOrderForm.tsx
            Route::get('/{variant}', [VariantController::class, 'show']);
            // Used in: app/pos/vendor/[vendorId]/products/[productId]/page.tsx
            Route::put('/{variant}', [VariantController::class, 'update']);
            // Used in: app/pos/vendor/[vendorId]/products/[productId]/page.tsx
            Route::delete('/{variant}', [VariantController::class, 'destroy']);
            // Used in: app/pos/vendor/[vendorId]/products/_components/ProductForm.tsx
            Route::post('/{variant}/generate-barcode', [VariantController::class, 'generateBarcode']);
        });

        // Branch Product routes (protected)
        Route::prefix('branch-products')->middleware('permission:can_view_stock_and_inventory')->group(function () {
            // Used in: app/pos/vendor/[vendorId]/inventory/_components/NewInventoryModal.tsx, app/pos/vendor/[vendorId]/inventory/page.tsx, components/navbar.tsx
            Route::get('/', [BranchProductController::class, 'index']);
            // Used in: app/pos/vendor/[vendorId]/inventory/page.tsx
            Route::post('/toggle-status', [BranchProductController::class, 'toggleStatus'])->middleware('permission:can_manage_catalog');
            // Used in: app/pos/vendor/[vendorId]/inventory/_components/AddStockModal.tsx
            Route::post('/add-stock', [BranchProductController::class, 'addStock'])->middleware('permission:can_manage_stock_and_inventory');
            // Used in: app/pos/vendor/[vendorId]/inventory/_components/ViewStockModal.tsx
            Route::get('/stocks', [BranchProductController::class, 'getStocks']);
            // Used in: app/pos/vendor/[vendorId]/inventory/_components/ViewStockModal.tsx
            Route::put('/stocks/{stock}', [BranchProductController::class, 'updateStock'])->middleware('permission:can_manage_stock_and_inventory');
            // Used in: app/pos/vendor/[vendorId]/inventory/_components/ViewStockModal.tsx
            Route::delete('/stocks/{stock}', [BranchProductController::class, 'destroyStock'])->middleware('permission:can_manage_stock_and_inventory');
        });

        // Unit of Measure routes (protected)
        Route::prefix('units-of-measure')->group(function () {
            // Used in: app/pos/vendor/[vendorId]/products/_components/ProductForm.tsx, app/pos/vendor/[vendorId]/products/units/page.tsx
            Route::get('/', [UnitOfMeasureController::class, 'index'])->middleware('permission:can_view_catalog');
            // Used in: app/pos/vendor/[vendorId]/products/units/_components/UnitOfMeasureForm.tsx
            Route::post('/', [UnitOfMeasureController::class, 'store'])->middleware('permission:can_manage_catalog');
            // Used in: app/pos/vendor/[vendorId]/products/_components/ProductForm.tsx, app/pos/vendor/[vendorId]/products/units/page.tsx
            Route::get('/{unitOfMeasure}', [UnitOfMeasureController::class, 'show'])->middleware('permission:can_view_catalog');
            // Used in: app/pos/vendor/[vendorId]/products/units/_components/UnitOfMeasureForm.tsx
            Route::put('/{unitOfMeasure}', [UnitOfMeasureController::class, 'update'])->middleware('permission:can_manage_catalog');
            // Used in: app/pos/vendor/[vendorId]/products/units/page.tsx
            Route::delete('/{unitOfMeasure}', [UnitOfMeasureController::class, 'destroy'])->middleware('permission:can_delete_catalog');
        });

        // Dashboard & Reports
        // Used in: app/pos/vendor/[vendorId]/dashboard/page.tsx
        Route::get('/dashboard/stats', [DashboardController::class, 'index'])->middleware('permission:can_view_reports');
        // Used in: app/pos/vendor/[vendorId]/reports/sales/page.tsx
        Route::get('/reports/sales', [ReportController::class, 'sales'])->middleware('permission:can_view_reports');
        // Used in: app/pos/vendor/[vendorId]/reports/bills/page.tsx
        Route::get('/reports/financial', [ReportController::class, 'financialLedger'])->middleware('permission:can_view_reports');
        // Used in: app/pos/vendor/[vendorId]/reports/inventory/page.tsx
        Route::get('/reports/inventory', [ReportController::class, 'inventorySummary'])->middleware('permission:can_view_reports');

        // Supplier routes (protected)
        Route::prefix('suppliers')->group(function () {
            // Used in: app/pos/vendor/[vendorId]/procurement/orders/_components/PurchaseOrderForm.tsx, app/pos/vendor/[vendorId]/procurement/suppliers/page.tsx
            Route::get('/', [SupplierController::class, 'index'])->middleware('permission:can_view_operations');
            // Used in: app/pos/vendor/[vendorId]/procurement/suppliers/_components/SupplierForm.tsx
            Route::post('/', [SupplierController::class, 'store'])->middleware('permission:can_manage_operations');
            // Used in: app/pos/vendor/[vendorId]/procurement/orders/_components/PurchaseOrderForm.tsx, app/pos/vendor/[vendorId]/procurement/suppliers/page.tsx
            Route::get('/{supplier}', [SupplierController::class, 'show'])->middleware('permission:can_view_operations');
            // Used in: app/pos/vendor/[vendorId]/procurement/suppliers/_components/SupplierForm.tsx
            Route::put('/{supplier}', [SupplierController::class, 'update'])->middleware('permission:can_manage_operations');
            // Used in: app/pos/vendor/[vendorId]/procurement/suppliers/page.tsx
            Route::delete('/{supplier}', [SupplierController::class, 'destroy'])->middleware('permission:can_delete_operations');
        });

        // Tax routes (protected)
        Route::prefix('taxes')->group(function () {
            // Used in: app/pos/vendor/[vendorId]/settings/taxes/page.tsx
            Route::get('/', [TaxController::class, 'index'])->middleware('permission:can_view_organization_settings');
            // Used in: app/pos/vendor/[vendorId]/settings/taxes/_components/TaxForm.tsx
            Route::post('/', [TaxController::class, 'store'])->middleware('permission:can_edit_organization_settings');
            // Used in: app/pos/vendor/[vendorId]/settings/taxes/page.tsx
            Route::get('/{tax}', [TaxController::class, 'show'])->middleware('permission:can_view_organization_settings');
            // Used in: app/pos/vendor/[vendorId]/settings/taxes/_components/TaxForm.tsx
            Route::put('/{tax}', [TaxController::class, 'update'])->middleware('permission:can_edit_organization_settings');
            // Used in: app/pos/vendor/[vendorId]/settings/taxes/page.tsx
            Route::delete('/{tax}', [TaxController::class, 'destroy'])->middleware('permission:can_delete_organization_settings');
        });

        // Promotion routes (protected)
        Route::prefix('promotions')->group(function () {
            // Used in: app/pos/vendor/[vendorId]/promotions/page.tsx
            Route::get('/', [PromotionController::class, 'index'])->middleware('permission:can_view_promotions');
            // Bulk update status
            Route::post('/bulk-status', [PromotionController::class, 'bulkStatus'])->middleware('permission:can_edit_promotions');
            // Used in: app/pos/vendor/[vendorId]/promotions/_components/PromotionForm.tsx
            Route::post('/', [PromotionController::class, 'store'])->middleware('permission:can_edit_promotions');
            // Used in: app/pos/vendor/[vendorId]/promotions/page.tsx
            Route::get('/{promotion}', [PromotionController::class, 'show'])->middleware('permission:can_view_promotions');
            // Used in: app/pos/vendor/[vendorId]/promotions/_components/PromotionForm.tsx
            Route::put('/{promotion}', [PromotionController::class, 'update'])->middleware('permission:can_edit_promotions');
            // Used in: app/pos/vendor/[vendorId]/promotions/page.tsx
            Route::delete('/{promotion}', [PromotionController::class, 'destroy'])->middleware('permission:can_delete_promotions');
        });

        // Customer routes (protected)
        Route::prefix('customers')->group(function () {
            // Used in: app/pos/vendor/[vendorId]/customers/credits/_components/StoreCreditForm.tsx, app/pos/vendor/[vendorId]/customers/page.tsx, app/pos/vendor/[vendorId]/pos/_components/CustomerSelector.tsx
            Route::get('/', [CustomerController::class, 'index'])->middleware('permission:can_view_customers');
            // Used in: app/pos/vendor/[vendorId]/customers/_components/CustomerForm.tsx
            Route::post('/', [CustomerController::class, 'store'])->middleware('permission:can_edit_customers');
            // Not currently used in the frontend
            Route::post('/import', [CustomerController::class, 'import'])->middleware('permission:can_edit_customers');
            // Used in: app/pos/vendor/[vendorId]/customers/credits/_components/StoreCreditForm.tsx, app/pos/vendor/[vendorId]/customers/page.tsx, app/pos/vendor/[vendorId]/pos/_components/CustomerSelector.tsx
            Route::get('/{customer}', [CustomerController::class, 'show'])->middleware('permission:can_view_customers');
            // Used in: app/pos/vendor/[vendorId]/customers/_components/CustomerForm.tsx
            Route::put('/{customer}', [CustomerController::class, 'update'])->middleware('permission:can_edit_customers');
            // Not currently used in the frontend
            Route::get('/export', [CustomerController::class, 'export'])->middleware('permission:can_view_financial_analytics');
            // Used in: app/pos/vendor/[vendorId]/customers/page.tsx
            Route::delete('/{customer}', [CustomerController::class, 'destroy'])->middleware('permission:can_delete_customers');
        });

        // Expense Category routes (protected)
        Route::prefix('expense-categories')->group(function () {
            // Used in: app/pos/vendor/[vendorId]/expenses/_components/ExpenseForm.tsx, app/pos/vendor/[vendorId]/expenses/categories/page.tsx
            Route::get('/', [ExpenseCategoryController::class, 'index'])->middleware('permission:can_view_operations');
            // Used in: app/pos/vendor/[vendorId]/expenses/categories/_components/ExpenseCategoryForm.tsx
            Route::post('/', [ExpenseCategoryController::class, 'store'])->middleware('permission:can_manage_operations');
            // Used in: app/pos/vendor/[vendorId]/expenses/_components/ExpenseForm.tsx, app/pos/vendor/[vendorId]/expenses/categories/page.tsx
            Route::get('/{expenseCategory}', [ExpenseCategoryController::class, 'show'])->middleware('permission:can_view_operations');
            // Used in: app/pos/vendor/[vendorId]/expenses/categories/_components/ExpenseCategoryForm.tsx
            Route::put('/{expenseCategory}', [ExpenseCategoryController::class, 'update'])->middleware('permission:can_manage_operations');
            // Used in: app/pos/vendor/[vendorId]/expenses/categories/page.tsx
            Route::delete('/{expenseCategory}', [ExpenseCategoryController::class, 'destroy'])->middleware('permission:can_delete_operations');
        });

        // Expense routes (protected)
        Route::prefix('expenses')->group(function () {
            // Used in: app/pos/vendor/[vendorId]/expenses/page.tsx
            Route::get('/', [ExpenseController::class, 'index'])->middleware('permission:can_view_operations');
            // Used in: app/pos/vendor/[vendorId]/expenses/_components/ExpenseForm.tsx
            Route::post('/', [ExpenseController::class, 'store'])->middleware('permission:can_manage_operations');
            // Used in: app/pos/vendor/[vendorId]/expenses/page.tsx
            Route::get('/{expense}', [ExpenseController::class, 'show'])->middleware('permission:can_view_operations');
            // Used in: app/pos/vendor/[vendorId]/expenses/_components/ExpenseForm.tsx
            Route::put('/{expense}', [ExpenseController::class, 'update'])->middleware('permission:can_manage_operations');
            // Used in: app/pos/vendor/[vendorId]/expenses/page.tsx
            Route::delete('/{expense}', [ExpenseController::class, 'destroy'])->middleware('permission:can_delete_operations');
        });

        // Purchase Order routes (protected)
        Route::prefix('purchase-orders')->group(function () {
            // Used in: app/pos/vendor/[vendorId]/procurement/orders/page.tsx
            Route::get('/', [PurchaseOrderController::class, 'index'])->middleware('permission:can_view_operations');
            // Used in: app/pos/vendor/[vendorId]/procurement/orders/_components/PurchaseOrderForm.tsx
            Route::post('/', [PurchaseOrderController::class, 'store'])->middleware('permission:can_manage_operations');
            // Used in: app/pos/vendor/[vendorId]/procurement/orders/[orderId]/page.tsx
            Route::get('/{purchaseOrder}', [PurchaseOrderController::class, 'show'])->middleware('permission:can_view_operations');
            // Used in: app/pos/vendor/[vendorId]/procurement/orders/_components/PurchaseOrderForm.tsx
            Route::put('/{purchaseOrder}', [PurchaseOrderController::class, 'update'])->middleware('permission:can_manage_operations');
            // Used in: app/pos/vendor/[vendorId]/procurement/orders/page.tsx
            Route::delete('/{purchaseOrder}', [PurchaseOrderController::class, 'destroy'])->middleware('permission:can_delete_operations');
        });

        // Sale routes (protected)
        Route::prefix('sales')->middleware('permission:can_use_pos')->group(function () {
            // Used in: app/pos/vendor/[vendorId]/returns/_components/ReturnForm.tsx, app/pos/vendor/[vendorId]/sales/page.tsx
            Route::get('/', [SaleController::class, 'index']);
            // Used in: app/pos/vendor/[vendorId]/pos/page.tsx
            Route::post('/', [SaleController::class, 'store']);
            // Used in: app/pos/vendor/[vendorId]/returns/_components/ReturnForm.tsx
            Route::get('/{sale}', [SaleController::class, 'show']);
            // Used in: app/pos/vendor/[vendorId]/sales/page.tsx
            Route::put('/{sale}', [SaleController::class, 'update'])->middleware('permission:can_manage_sales');
            // Used in: app/pos/vendor/[vendorId]/sales/page.tsx
            Route::post('/{sale}/void', [SaleController::class, 'void'])->middleware('permission:can_manage_sales');
            // Not currently used in the frontend
            Route::get('/export', [SaleController::class, 'export'])->middleware('permission:can_view_financial_analytics');
            // Used in: app/pos/vendor/[vendorId]/sales/page.tsx
            Route::delete('/{sale}', [SaleController::class, 'destroy'])->middleware('permission:can_manage_sales');
        });

        // POS-specific specialized routes
        Route::prefix('pos')->middleware('permission:can_use_pos')->group(function () {
            // Used in: app/pos/vendor/[vendorId]/pos/page.tsx
            Route::get('/active-session', [CashRegisterSessionController::class, 'posActiveSession']);
            // Used in: app/pos/vendor/[vendorId]/pos/_components/PosTouchScreen.tsx, app/pos/vendor/[vendorId]/pos/_components/keyboard/KeyboardCustomer.tsx
            Route::get('/customers', [CustomerController::class, 'posIndex']);
            // Used in: app/pos/vendor/[vendorId]/pos/page.tsx
            Route::get('/payment-methods', [PaymentMethodController::class, 'posIndex']);
            // Used in: app/pos/vendor/[vendorId]/pos/_components/ProductSelection.tsx, app/pos/vendor/[vendorId]/pos/page.tsx
            Route::get('/products', [BranchProductController::class, 'index']);
            // Used in: app/pos/vendor/[vendorId]/pos/_components/ProductSelection.tsx, app/pos/vendor/[vendorId]/pos/page.tsx
            Route::get('/products/stocks', [BranchProductController::class, 'getStocks']);
            // Used in: app/pos/vendor/[vendorId]/pos/page.tsx
            Route::post('/calculate-discounts', [PromotionController::class, 'calculateDiscounts']);
        });

        // Stock Transfer routes (protected)
        Route::prefix('stock-transfers')->group(function () {
            // Used in: app/pos/vendor/[vendorId]/inventory/transfers/page.tsx
            Route::get('/', [StockTransferController::class, 'index'])->middleware('permission:can_view_stock_and_inventory');
            // Used in: app/pos/vendor/[vendorId]/inventory/transfers/_components/StockTransferForm.tsx
            Route::get('/search-variants', [BranchProductController::class, 'index'])->middleware('permission:can_view_stock_and_inventory');
            // Used in: app/pos/vendor/[vendorId]/inventory/transfers/_components/StockTransferForm.tsx
            Route::post('/', [StockTransferController::class, 'store'])->middleware('permission:can_manage_stock_and_inventory');
            // Used in: app/pos/vendor/[vendorId]/inventory/transfers/[transferId]/page.tsx
            Route::get('/{stockTransfer}', [StockTransferController::class, 'show'])->middleware('permission:can_view_stock_and_inventory');
            // Used in: app/pos/vendor/[vendorId]/inventory/transfers/_components/StockTransferForm.tsx
            Route::put('/{stockTransfer}', [StockTransferController::class, 'update'])->middleware('permission:can_manage_stock_and_inventory');
            // Used in: app/pos/vendor/[vendorId]/inventory/transfers/[transferId]/page.tsx
            Route::post('/{stockTransfer}/status', [StockTransferController::class, 'updateTransferStatus'])->middleware('permission:can_manage_stock_and_inventory');
            // Used in: app/pos/vendor/[vendorId]/inventory/transfers/page.tsx
            Route::delete('/{stockTransfer}', [StockTransferController::class, 'destroy'])->middleware('permission:can_manage_stock_and_inventory');
        });

        // Inventory Adjustment routes (protected)
        Route::prefix('inventory-adjustments')->middleware('permission:can_manage_stock_and_inventory')->group(function () {
            // Used in: app/pos/vendor/[vendorId]/inventory/adjustments/page.tsx
            Route::get('/', [InventoryAdjustmentController::class, 'index']);
            // Used in: app/pos/vendor/[vendorId]/inventory/adjustments/_components/InventoryAdjustmentForm.tsx
            Route::post('/', [InventoryAdjustmentController::class, 'store']);
            // Used in: app/pos/vendor/[vendorId]/inventory/adjustments/page.tsx
            Route::get('/{inventoryAdjustment}', [InventoryAdjustmentController::class, 'show']);
            // Used in: app/pos/vendor/[vendorId]/inventory/adjustments/_components/InventoryAdjustmentForm.tsx
            Route::put('/{inventoryAdjustment}', [InventoryAdjustmentController::class, 'update']);
            // Used in: app/pos/vendor/[vendorId]/inventory/adjustments/page.tsx
            Route::delete('/{inventoryAdjustment}', [InventoryAdjustmentController::class, 'destroy']);
        });

        // Role routes (protected)
        Route::prefix('roles')->group(function () {
            // Used in: app/pos/vendor/[vendorId]/roles/page.tsx, app/pos/vendor/[vendorId]/users/_components/UserForm.tsx, app/pos/vendor/[vendorId]/users/page.tsx
            Route::get('/', [RoleController::class, 'index'])->middleware('permission:can_view_access_control');
            // Used in: app/pos/vendor/[vendorId]/roles/_components/RoleForm.tsx
            Route::post('/', [RoleController::class, 'store'])->middleware('permission:can_manage_access_control');
            // Used in: app/pos/vendor/[vendorId]/roles/[roleId]/page.tsx
            Route::get('/{role}', [RoleController::class, 'show'])->middleware('permission:can_view_access_control');
            // Used in: app/pos/vendor/[vendorId]/roles/_components/RoleForm.tsx
            Route::put('/{role}', [RoleController::class, 'update'])->middleware('permission:can_manage_access_control');
            // Used in: app/pos/vendor/[vendorId]/roles/page.tsx
            Route::delete('/{role}', [RoleController::class, 'destroy'])->middleware('permission:can_delete_access_control');
        });

        // Billing Counter routes (protected)
        Route::prefix('billing-counters')->group(function () {
            // Used in: app/pos/vendor/[vendorId]/branches/counters/page.tsx, app/pos/vendor/[vendorId]/cash-management/_components/CashSessionForm.tsx, app/pos/vendor/[vendorId]/pos/_components/RegisterStatusModal.tsx
            Route::get('/', [BillingCounterController::class, 'index'])->middleware('permission:can_view_organization_settings');
            // Used in: app/pos/vendor/[vendorId]/branches/counters/_components/BillingCounterForm.tsx
            Route::post('/', [BillingCounterController::class, 'store'])->middleware('permission:can_edit_organization_settings');
            // Used in: app/pos/vendor/[vendorId]/branches/counters/page.tsx, app/pos/vendor/[vendorId]/cash-management/_components/CashSessionForm.tsx, app/pos/vendor/[vendorId]/pos/_components/RegisterStatusModal.tsx
            Route::get('/{billingCounter}', [BillingCounterController::class, 'show'])->middleware('permission:can_view_organization_settings');
            // Used in: app/pos/vendor/[vendorId]/branches/counters/_components/BillingCounterForm.tsx
            Route::put('/{billingCounter}', [BillingCounterController::class, 'update'])->middleware('permission:can_edit_organization_settings');
            // Used in: app/pos/vendor/[vendorId]/branches/counters/page.tsx
            Route::delete('/{billingCounter}', [BillingCounterController::class, 'destroy'])->middleware('permission:can_delete_organization_settings');
        });

        // Branch routes (protected)
        Route::prefix('branches')->group(function () {
            // Used in: app/pos/vendor/[vendorId]/branches/counters/_components/BillingCounterForm.tsx, app/pos/vendor/[vendorId]/branches/page.tsx, app/pos/vendor/[vendorId]/expenses/_components/ExpenseForm.tsx, app/pos/vendor/[vendorId]/inventory/adjustments/_components/InventoryAdjustmentForm.tsx, app/pos/vendor/[vendorId]/inventory/transfers/_components/StockTransferForm.tsx, app/pos/vendor/[vendorId]/procurement/orders/_components/PurchaseOrderForm.tsx, app/pos/vendor/[vendorId]/users/_components/UserForm.tsx
            Route::get('/', [BranchController::class, 'index'])->middleware('permission:can_view_organization_settings');
            // Used in: app/pos/vendor/[vendorId]/branches/_components/BranchForm.tsx
            Route::post('/', [BranchController::class, 'store'])->middleware('permission:can_edit_organization_settings');
            // Used in: app/pos/vendor/[vendorId]/branches/counters/_components/BillingCounterForm.tsx, app/pos/vendor/[vendorId]/branches/page.tsx, app/pos/vendor/[vendorId]/expenses/_components/ExpenseForm.tsx, app/pos/vendor/[vendorId]/inventory/adjustments/_components/InventoryAdjustmentForm.tsx, app/pos/vendor/[vendorId]/inventory/transfers/_components/StockTransferForm.tsx, app/pos/vendor/[vendorId]/procurement/orders/_components/PurchaseOrderForm.tsx, app/pos/vendor/[vendorId]/users/_components/UserForm.tsx
            Route::get('/{branch}', [BranchController::class, 'show'])->middleware('permission:can_view_organization_settings');
            // Used in: app/pos/vendor/[vendorId]/branches/_components/BranchForm.tsx
            Route::put('/{branch}', [BranchController::class, 'update'])->middleware('permission:can_edit_organization_settings');
            // Used in: app/pos/vendor/[vendorId]/branches/page.tsx
            Route::delete('/{branch}', [BranchController::class, 'destroy'])->middleware('permission:can_delete_organization_settings');
        });

        // Cash Register Session routes (protected)
        Route::prefix('cash-register-sessions')->group(function () {
            // Used in: app/pos/vendor/[vendorId]/pos/_components/RegisterStatusModal.tsx
            Route::get('/active', [CashRegisterSessionController::class, 'activeSession']);
            
            // Used in: app/pos/vendor/[vendorId]/cash-management/page.tsx
            Route::get('/', [CashRegisterSessionController::class, 'index'])->middleware('permission:can_view_reports');
            // Used in: app/pos/vendor/[vendorId]/pos/_components/RegisterStatusModal.tsx
            Route::get('/{cashRegisterSession}', [CashRegisterSessionController::class, 'show'])->middleware('permission:can_view_reports');
            
            // Used in: app/pos/vendor/[vendorId]/pos/_components/RegisterStatusModal.tsx
            Route::post('/open', [CashRegisterSessionController::class, 'openSession'])->middleware('permission:can_manage_cash_drawer');
            // Used in: app/pos/vendor/[vendorId]/pos/_components/RegisterStatusModal.tsx
            Route::post('/{cashRegisterSession}/close', [CashRegisterSessionController::class, 'closeSession'])->middleware('permission:can_manage_cash_drawer');
            // Used in: app/pos/vendor/[vendorId]/cash-management/_components/CashSessionForm.tsx
            Route::put('/{cashRegisterSession}', [CashRegisterSessionController::class, 'update'])->middleware('permission:can_manage_cash_drawer');
            // Used in: app/pos/vendor/[vendorId]/cash-management/page.tsx
            Route::delete('/{cashRegisterSession}', [CashRegisterSessionController::class, 'destroy'])->middleware('permission:can_manage_cash_drawer');
        });

        // Cash Transaction routes (protected)
        Route::prefix('cash-transactions')->group(function () {
            // Used in: app/pos/vendor/[vendorId]/cash-management/page.tsx
            Route::get('/', [CashTransactionController::class, 'index'])->middleware('permission:can_manage_cash_drawer');
            // Used in: app/pos/vendor/[vendorId]/pos/_components/RegisterStatusModal.tsx
            Route::post('/', [CashTransactionController::class, 'store'])->middleware('permission:can_manage_cash_drawer');
            // Used in: app/pos/vendor/[vendorId]/cash-management/page.tsx
            Route::get('/{cashTransaction}', [CashTransactionController::class, 'show'])->middleware('permission:can_manage_cash_drawer');
        });

        // Customer Store Credit routes (protected)
        Route::prefix('customer-store-credits')->middleware('permission:can_issue_store_credit')->group(function () {
            // Used in: app/pos/vendor/[vendorId]/customers/credits/page.tsx
            Route::get('/', [CustomerStoreCreditController::class, 'index']);
            // Used in: app/pos/vendor/[vendorId]/customers/credits/_components/StoreCreditForm.tsx
            Route::post('/', [CustomerStoreCreditController::class, 'store']);
            // Used in: app/pos/vendor/[vendorId]/customers/credits/page.tsx
            Route::get('/{customerStoreCredit}', [CustomerStoreCreditController::class, 'show']);
            // Used in: app/pos/vendor/[vendorId]/customers/credits/_components/StoreCreditForm.tsx
            Route::put('/{customerStoreCredit}', [CustomerStoreCreditController::class, 'update']);
            // Used in: app/pos/vendor/[vendorId]/customers/credits/page.tsx
            Route::delete('/{customerStoreCredit}', [CustomerStoreCreditController::class, 'destroy']);
        });

        // Payment Method routes (protected)
        Route::prefix('payment-methods')->group(function () {
            // Used in: app/pos/vendor/[vendorId]/pos/_components/PaymentSection.tsx, app/pos/vendor/[vendorId]/pos/_components/RegisterStatusModal.tsx, app/pos/vendor/[vendorId]/sales/page.tsx, app/pos/vendor/[vendorId]/settings/payment-methods/page.tsx
            Route::get('/', [PaymentMethodController::class, 'index'])->middleware('permission:can_view_organization_settings');
            // Used in: app/pos/vendor/[vendorId]/settings/payment-methods/_components/PaymentMethodForm.tsx
            Route::post('/', [PaymentMethodController::class, 'store'])->middleware('permission:can_edit_organization_settings');
            // Used in: app/pos/vendor/[vendorId]/pos/_components/PaymentSection.tsx, app/pos/vendor/[vendorId]/pos/_components/RegisterStatusModal.tsx, app/pos/vendor/[vendorId]/sales/page.tsx, app/pos/vendor/[vendorId]/settings/payment-methods/page.tsx
            Route::get('/{paymentMethod}', [PaymentMethodController::class, 'show'])->middleware('permission:can_view_organization_settings');
            // Used in: app/pos/vendor/[vendorId]/settings/payment-methods/_components/PaymentMethodForm.tsx
            Route::put('/{paymentMethod}', [PaymentMethodController::class, 'update'])->middleware('permission:can_edit_organization_settings');
            // Used in: app/pos/vendor/[vendorId]/settings/payment-methods/page.tsx
            Route::delete('/{paymentMethod}', [PaymentMethodController::class, 'destroy'])->middleware('permission:can_delete_organization_settings');
        });

        // Receipt Settings routes (protected)
        Route::prefix('receipt-settings')->middleware('permission:can_edit_organization_settings')->group(function () {
            // Used in: app/pos/vendor/[vendorId]/sales/page.tsx
            Route::get('/', [ReceiptSettingsController::class, 'index']);
            // Used in: app/pos/vendor/[vendorId]/settings/receipts/page.tsx
            Route::post('/', [ReceiptSettingsController::class, 'store']);
            // Used in: app/pos/vendor/[vendorId]/pos/page.tsx, app/pos/vendor/[vendorId]/settings/receipts/page.tsx
            Route::get('/{vendor_id}', [ReceiptSettingsController::class, 'show']);
            // Used in: app/pos/vendor/[vendorId]/settings/receipts/page.tsx
            Route::put('/{vendor_id}', [ReceiptSettingsController::class, 'update']);
            // Not currently used in the frontend
            Route::delete('/{vendor_id}', [ReceiptSettingsController::class, 'destroy']);
        });

        // Sale Return routes (protected)
        Route::prefix('sale-returns')->middleware('permission:can_process_returns')->group(function () {
            // Used in: app/pos/vendor/[vendorId]/returns/page.tsx
            Route::get('/', [SaleReturnController::class, 'index']);
            // Used in: app/pos/vendor/[vendorId]/returns/_components/ReturnForm.tsx
            Route::post('/', [SaleReturnController::class, 'store']);
            // Used in: app/pos/vendor/[vendorId]/returns/page.tsx
            Route::get('/{saleReturn}', [SaleReturnController::class, 'show']);
            // Used in: app/pos/vendor/[vendorId]/returns/_components/ReturnForm.tsx
            Route::put('/{saleReturn}', [SaleReturnController::class, 'update']);
            // Used in: app/pos/vendor/[vendorId]/returns/page.tsx
            Route::delete('/{saleReturn}', [SaleReturnController::class, 'destroy']);
        });

        // Membership routes (protected)
        Route::prefix('memberships')->group(function () {
            // Not currently used in the frontend
            Route::get('/', [MembershipController::class, 'index'])->middleware('permission:can_view_access_control');
            // Not currently used in the frontend
            Route::post('/', [MembershipController::class, 'store'])->middleware('permission:can_manage_access_control');
            // Not currently used in the frontend
            Route::get('/{membership}', [MembershipController::class, 'show'])->middleware('permission:can_view_access_control');
            // Not currently used in the frontend
            Route::put('/{membership}', [MembershipController::class, 'update'])->middleware('permission:can_manage_access_control');
            // Not currently used in the frontend
            Route::delete('/{membership}', [MembershipController::class, 'destroy'])->middleware('permission:can_delete_access_control');
        });

        // Activity Logs (protected)
        Route::prefix('activity-logs')->middleware('permission:can_view_access_control')->group(function () {
            // Used in: app/pos/vendor/[vendorId]/activity-log/page.tsx
            Route::get('/', [ActivityLogController::class, 'index']);
            // Used in: app/pos/vendor/[vendorId]/activity-log/page.tsx
            Route::get('/{activityLog}', [ActivityLogController::class, 'show']);
        });

        // User Branch Assignment routes (protected)
        Route::prefix('user-branch-assignments')->group(function () {
            // Not currently used in the frontend
            Route::get('/', [UserBranchAssignmentController::class, 'index'])->middleware('permission:can_view_access_control');
            // Not currently used in the frontend
            Route::post('/', [UserBranchAssignmentController::class, 'store'])->middleware('permission:can_manage_access_control');
            // Not currently used in the frontend
            Route::get('/{userBranchAssignment}', [UserBranchAssignmentController::class, 'show'])->middleware('permission:can_view_access_control');
            // Not currently used in the frontend
            Route::put('/{userBranchAssignment}', [UserBranchAssignmentController::class, 'update'])->middleware('permission:can_manage_access_control');
            // Not currently used in the frontend
            Route::delete('/{userBranchAssignment}', [UserBranchAssignmentController::class, 'destroy'])->middleware('permission:can_delete_access_control');
        });

        // Vendor User routes (protected) - explicitly using VendorUserController
        // These routes are usually context-dependent on the vendor passed in query or body
        // but typically 'users' endpoint suggests managing users under the current context
        Route::prefix('users')->group(function () {
            // Used in: app/pos/vendor/[vendorId]/users/page.tsx
            Route::get('/', [\App\Http\Controllers\VendorUserController::class, 'index'])->middleware('permission:can_view_access_control');
            // Used in: app/pos/vendor/[vendorId]/users/_components/UserForm.tsx
            Route::post('/', [\App\Http\Controllers\VendorUserController::class, 'store'])->middleware('permission:can_manage_access_control');
            // Not currently used in the frontend
            Route::delete('/bulk', [\App\Http\Controllers\VendorUserController::class, 'bulkDestroy'])->middleware('permission:can_delete_access_control');
            // Used in: app/pos/vendor/[vendorId]/users/page.tsx
            Route::get('/{user}', [\App\Http\Controllers\VendorUserController::class, 'show'])->middleware('permission:can_view_access_control');
            // Used in: app/pos/vendor/[vendorId]/users/_components/UserForm.tsx
            Route::put('/{user}', [\App\Http\Controllers\VendorUserController::class, 'update'])->middleware('permission:can_manage_access_control');
            // Used in: app/pos/vendor/[vendorId]/users/page.tsx
            Route::delete('/{user}', [\App\Http\Controllers\VendorUserController::class, 'destroy'])->middleware('permission:can_delete_access_control');
        });
    });

    // Health check route (public)
    // Health check endpoint
    Route::get('health', function () {
        return response()->json([
            'status' => 'healthy',
            'timestamp' => now()->toISOString(),
            'version' => '1.0.0'
        ]);
    });

});