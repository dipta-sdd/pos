<?php

use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\VariantController;
use App\Http\Controllers\UnitOfMeasureController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\TaxController;
use App\Http\Controllers\PromotionController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\ExpenseCategoryController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\StockTransferController;
use App\Http\Controllers\InventoryAdjustmentController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\BillingCounterController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\CashRegisterSessionController;
use App\Http\Controllers\CustomerStoreCreditController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\ReceiptSettingsController;
use App\Http\Controllers\SaleReturnController;
use App\Http\Controllers\MembershipController;
use App\Http\Controllers\UserBranchAssignmentController;
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

    // Public authentication routes
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login']);
        Route::post('register', [AuthController::class, 'register']);
        Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('reset-password', [AuthController::class, 'resetPassword']);
    });

    Route::middleware(['auth:api', 'user.permissions'])->group(function () {
        // Protected authentication routes
        Route::prefix('auth')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::post('refresh', [AuthController::class, 'refresh']);
            Route::get('me', [AuthController::class, 'userProfile']);
            // Route::put('profile', [AuthController::class, 'updateProfile']);
            // Route::put('change-password', [AuthController::class, 'changePassword']);
        });

        // Vendor routes (protected)
        Route::prefix('vendors')->group(function () {
            Route::post('/', [VendorController::class, 'store']);
            Route::get('/', [VendorController::class, 'index']);
            Route::middleware('vendor.scope')->group(function () {
                Route::get('/{vendor_id}', [VendorController::class, 'show']);
            });
        });

        // Category routes (protected)
        Route::prefix('categories')->middleware('permission:can_manage_categories')->group(function () {
            Route::get('/', [CategoryController::class, 'index']);
            Route::post('/', [CategoryController::class, 'store']);
            Route::get('/{category}', [CategoryController::class, 'show']);
            Route::put('/{category}', [CategoryController::class, 'update']);
            Route::delete('/{category}', [CategoryController::class, 'destroy']);
        });

        // Product routes (protected)
        Route::prefix('products')->group(function () {
            Route::get('/', [ProductController::class, 'index'])->middleware('permission:can_view_products');
            Route::post('/', [ProductController::class, 'store'])->middleware('permission:can_manage_products');
            Route::get('/{product}', [ProductController::class, 'show'])->middleware('permission:can_view_products');
            Route::put('/{product}', [ProductController::class, 'update'])->middleware('permission:can_manage_products');
            Route::delete('/{product}', [ProductController::class, 'destroy'])->middleware('permission:can_manage_products');
        });

        // Variant routes (protected)
        Route::prefix('variants')->middleware('permission:can_manage_products')->group(function () {
            Route::get('/', [VariantController::class, 'index']);
            Route::post('/', [VariantController::class, 'store']);
            Route::get('/{variant}', [VariantController::class, 'show']);
            Route::put('/{variant}', [VariantController::class, 'update']);
            Route::delete('/{variant}', [VariantController::class, 'destroy']);
        });

        // Unit of Measure routes (protected)
        Route::prefix('units-of-measure')->middleware('permission:can_manage_units_of_measure')->group(function () {
            Route::get('/', [UnitOfMeasureController::class, 'index']);
            Route::post('/', [UnitOfMeasureController::class, 'store']);
            Route::get('/{unitOfMeasure}', [UnitOfMeasureController::class, 'show']);
            Route::put('/{unitOfMeasure}', [UnitOfMeasureController::class, 'update']);
            Route::delete('/{unitOfMeasure}', [UnitOfMeasureController::class, 'destroy']);
        });

        // Supplier routes (protected)
        Route::prefix('suppliers')->middleware('permission:can_manage_suppliers')->group(function () {
            Route::get('/', [SupplierController::class, 'index']);
            Route::post('/', [SupplierController::class, 'store']);
            Route::get('/{supplier}', [SupplierController::class, 'show']);
            Route::put('/{supplier}', [SupplierController::class, 'update']);
            Route::delete('/{supplier}', [SupplierController::class, 'destroy']);
        });

        // Tax routes (protected)
        Route::prefix('taxes')->middleware('permission:can_configure_taxes')->group(function () {
            Route::get('/', [TaxController::class, 'index']);
            Route::post('/', [TaxController::class, 'store']);
            Route::get('/{tax}', [TaxController::class, 'show']);
            Route::put('/{tax}', [TaxController::class, 'update']);
            Route::delete('/{tax}', [TaxController::class, 'destroy']);
        });

        // Promotion routes (protected)
        Route::prefix('promotions')->group(function () {
            Route::get('/', [PromotionController::class, 'index'])->middleware('permission:can_view_promotions');
            Route::post('/', [PromotionController::class, 'store'])->middleware('permission:can_manage_promotions');
            Route::get('/{promotion}', [PromotionController::class, 'show'])->middleware('permission:can_view_promotions');
            Route::put('/{promotion}', [PromotionController::class, 'update'])->middleware('permission:can_manage_promotions');
            Route::delete('/{promotion}', [PromotionController::class, 'destroy'])->middleware('permission:can_manage_promotions');
        });

        // Customer routes (protected)
        Route::prefix('customers')->group(function () {
            Route::get('/', [CustomerController::class, 'index'])->middleware('permission:can_view_customers');
            Route::post('/', [CustomerController::class, 'store'])->middleware('permission:can_manage_customers');
            Route::get('/{customer}', [CustomerController::class, 'show'])->middleware('permission:can_view_customers');
            Route::put('/{customer}', [CustomerController::class, 'update'])->middleware('permission:can_manage_customers');
            Route::delete('/{customer}', [CustomerController::class, 'destroy'])->middleware('permission:can_manage_customers');
        });

        // Expense Category routes (protected)
        Route::prefix('expense-categories')->middleware('permission:can_manage_expenses')->group(function () {
            Route::get('/', [ExpenseCategoryController::class, 'index']);
            Route::post('/', [ExpenseCategoryController::class, 'store']);
            Route::get('/{expenseCategory}', [ExpenseCategoryController::class, 'show']);
            Route::put('/{expenseCategory}', [ExpenseCategoryController::class, 'update']);
            Route::delete('/{expenseCategory}', [ExpenseCategoryController::class, 'destroy']);
        });

        // Expense routes (protected)
        Route::prefix('expenses')->middleware('permission:can_manage_expenses')->group(function () {
            Route::get('/', [ExpenseController::class, 'index']);
            Route::post('/', [ExpenseController::class, 'store']);
            Route::get('/{expense}', [ExpenseController::class, 'show']);
            Route::put('/{expense}', [ExpenseController::class, 'update']);
            Route::delete('/{expense}', [ExpenseController::class, 'destroy']);
        });

        // Purchase Order routes (protected)
        Route::prefix('purchase-orders')->middleware('permission:can_manage_purchase_orders')->group(function () {
            Route::get('/', [PurchaseOrderController::class, 'index']);
            Route::post('/', [PurchaseOrderController::class, 'store']);
            Route::get('/{purchaseOrder}', [PurchaseOrderController::class, 'show']);
            Route::put('/{purchaseOrder}', [PurchaseOrderController::class, 'update']);
            Route::delete('/{purchaseOrder}', [PurchaseOrderController::class, 'destroy']);
        });

        // Sale routes (protected)
        Route::prefix('sales')->middleware('permission:can_use_pos')->group(function () {
            Route::get('/', [SaleController::class, 'index'])->middleware('permission:can_view_sales_history');
            Route::post('/', [SaleController::class, 'store']);
            Route::get('/{sale}', [SaleController::class, 'show'])->middleware('permission:can_view_sales_history');
            Route::put('/{sale}', [SaleController::class, 'update']);
            Route::delete('/{sale}', [SaleController::class, 'destroy']);
        });

        // Stock Transfer routes (protected)
        Route::prefix('stock-transfers')->middleware('permission:can_manage_stock_transfers')->group(function () {
            Route::get('/', [StockTransferController::class, 'index']);
            Route::post('/', [StockTransferController::class, 'store']);
            Route::get('/{stockTransfer}', [StockTransferController::class, 'show']);
            Route::put('/{stockTransfer}', [StockTransferController::class, 'update']);
            Route::delete('/{stockTransfer}', [StockTransferController::class, 'destroy']);
        });

        // Inventory Adjustment routes (protected)
        Route::prefix('inventory-adjustments')->middleware('permission:can_perform_stock_adjustments')->group(function () {
            Route::get('/', [InventoryAdjustmentController::class, 'index']);
            Route::post('/', [InventoryAdjustmentController::class, 'store']);
            Route::get('/{inventoryAdjustment}', [InventoryAdjustmentController::class, 'show']);
            Route::put('/{inventoryAdjustment}', [InventoryAdjustmentController::class, 'update']);
            Route::delete('/{inventoryAdjustment}', [InventoryAdjustmentController::class, 'destroy']);
        });

        // Role routes (protected)
        Route::prefix('roles')->group(function () {
            Route::get('/', [RoleController::class, 'index'])->middleware('permission:can_view_roles');
            Route::post('/', [RoleController::class, 'store'])->middleware('permission:can_manage_roles_and_permissions');
            Route::get('/{role}', [RoleController::class, 'show'])->middleware('permission:can_view_roles');
            Route::put('/{role}', [RoleController::class, 'update'])->middleware('permission:can_manage_roles_and_permissions');
            Route::delete('/{role}', [RoleController::class, 'destroy'])->middleware('permission:can_manage_roles_and_permissions');
        });

        // Billing Counter routes (protected)
        Route::prefix('billing-counters')->middleware('permission:can_manage_branches_and_counters')->group(function () {
            Route::get('/', [BillingCounterController::class, 'index']);
            Route::post('/', [BillingCounterController::class, 'store']);
            Route::get('/{billingCounter}', [BillingCounterController::class, 'show']);
            Route::put('/{billingCounter}', [BillingCounterController::class, 'update']);
            Route::delete('/{billingCounter}', [BillingCounterController::class, 'destroy']);
        });

        // Branch routes (protected)
        Route::prefix('branches')->middleware('permission:can_manage_branches_and_counters')->group(function () {
            Route::get('/', [BranchController::class, 'index']);
            Route::post('/', [BranchController::class, 'store']);
            Route::get('/{branch}', [BranchController::class, 'show']);
            Route::put('/{branch}', [BranchController::class, 'update']);
            Route::delete('/{branch}', [BranchController::class, 'destroy']);
        });

        // Cash Register Session routes (protected)
        Route::prefix('cash-register-sessions')->middleware('permission:can_open_close_cash_register')->group(function () {
            Route::get('/', [CashRegisterSessionController::class, 'index']);
            Route::post('/', [CashRegisterSessionController::class, 'store']);
            Route::get('/{cashRegisterSession}', [CashRegisterSessionController::class, 'show']);
            Route::put('/{cashRegisterSession}', [CashRegisterSessionController::class, 'update']);
            Route::delete('/{cashRegisterSession}', [CashRegisterSessionController::class, 'destroy']);
        });

        // Customer Store Credit routes (protected)
        Route::prefix('customer-store-credits')->middleware('permission:can_issue_store_credit')->group(function () {
            Route::get('/', [CustomerStoreCreditController::class, 'index']);
            Route::post('/', [CustomerStoreCreditController::class, 'store']);
            Route::get('/{customerStoreCredit}', [CustomerStoreCreditController::class, 'show']);
            Route::put('/{customerStoreCredit}', [CustomerStoreCreditController::class, 'update']);
            Route::delete('/{customerStoreCredit}', [CustomerStoreCreditController::class, 'destroy']);
        });

        // Payment Method routes (protected)
        Route::prefix('payment-methods')->middleware('permission:can_manage_payment_methods')->group(function () {
            Route::get('/', [PaymentMethodController::class, 'index']);
            Route::post('/', [PaymentMethodController::class, 'store']);
            Route::get('/{paymentMethod}', [PaymentMethodController::class, 'show']);
            Route::put('/{paymentMethod}', [PaymentMethodController::class, 'update']);
            Route::delete('/{paymentMethod}', [PaymentMethodController::class, 'destroy']);
        });

        // Receipt Settings routes (protected)
        Route::prefix('receipt-settings')->middleware('permission:can_customize_receipts')->group(function () {
            Route::get('/', [ReceiptSettingsController::class, 'index']);
            Route::post('/', [ReceiptSettingsController::class, 'store']);
            Route::get('/{vendor_id}', [ReceiptSettingsController::class, 'show']);
            Route::put('/{vendor_id}', [ReceiptSettingsController::class, 'update']);
            Route::delete('/{vendor_id}', [ReceiptSettingsController::class, 'destroy']);
        });

        // Sale Return routes (protected)
        Route::prefix('sale-returns')->middleware('permission:can_process_returns')->group(function () {
            Route::get('/', [SaleReturnController::class, 'index']);
            Route::post('/', [SaleReturnController::class, 'store']);
            Route::get('/{saleReturn}', [SaleReturnController::class, 'show']);
            Route::put('/{saleReturn}', [SaleReturnController::class, 'update']);
            Route::delete('/{saleReturn}', [SaleReturnController::class, 'destroy']);
        });

        // Membership routes (protected)
        Route::prefix('memberships')->middleware('permission:can_manage_staff')->group(function () {
            Route::get('/', [MembershipController::class, 'index']);
            Route::post('/', [MembershipController::class, 'store']);
            Route::get('/{membership}', [MembershipController::class, 'show']);
            Route::put('/{membership}', [MembershipController::class, 'update']);
            Route::delete('/{membership}', [MembershipController::class, 'destroy']);
        });

        // User Branch Assignment routes (protected)
        Route::prefix('user-branch-assignments')->middleware('permission:can_manage_staff')->group(function () {
            Route::get('/', [UserBranchAssignmentController::class, 'index']);
            Route::post('/', [UserBranchAssignmentController::class, 'store']);
            Route::get('/{userBranchAssignment}', [UserBranchAssignmentController::class, 'show']);
            Route::put('/{userBranchAssignment}', [UserBranchAssignmentController::class, 'update']);
            Route::delete('/{userBranchAssignment}', [UserBranchAssignmentController::class, 'destroy']);
        });

        // Vendor User routes (protected) - explicitly using VendorUserController
        // These routes are usually context-dependent on the vendor passed in query or body
        // but typically 'users' endpoint suggests managing users under the current context
        Route::prefix('users')->middleware('permission:can_manage_staff')->group(function () {
            Route::get('/', [\App\Http\Controllers\VendorUserController::class, 'index']);
            Route::post('/', [\App\Http\Controllers\VendorUserController::class, 'store']);
            Route::get('/{user}', [\App\Http\Controllers\VendorUserController::class, 'show']);
            Route::put('/{user}', [\App\Http\Controllers\VendorUserController::class, 'update']);
            Route::delete('/{user}', [\App\Http\Controllers\VendorUserController::class, 'destroy']);
        });
    });

    // Health check route (public)
    Route::get('health', function () {
        return response()->json([
            'status' => 'healthy',
            'timestamp' => now()->toISOString(),
            'version' => '1.0.0'
        ]);
    });

});