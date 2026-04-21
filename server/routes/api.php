<?php

use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OtpController;
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
use App\Http\Controllers\BranchProductController;
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

        Route::prefix('otp')->group(function () {
            Route::post('send', [OtpController::class, 'send']);
            Route::post('verify', [OtpController::class, 'verify']);
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
        Route::prefix('categories')->group(function () {
            Route::get('/', [CategoryController::class, 'index'])->middleware('permission:can_view_categories');
            Route::post('/', [CategoryController::class, 'store'])->middleware('permission:can_edit_categories');
            Route::get('/{category}', [CategoryController::class, 'show'])->middleware('permission:can_view_categories');
            Route::put('/{category}', [CategoryController::class, 'update'])->middleware('permission:can_edit_categories');
            Route::delete('/{category}', [CategoryController::class, 'destroy'])->middleware('permission:can_delete_categories');
        });

        // Product routes (protected)
        Route::prefix('products')->group(function () {
            Route::get('/', [ProductController::class, 'index'])->middleware('permission:can_view_products');
            Route::post('/', [ProductController::class, 'store'])->middleware('permission:can_edit_products');
            Route::get('/{product}', [ProductController::class, 'show'])->middleware('permission:can_view_products');
            Route::put('/{product}', [ProductController::class, 'update'])->middleware('permission:can_edit_products');
            Route::delete('/{product}', [ProductController::class, 'destroy'])->middleware('permission:can_delete_products');
        });

        // Variant routes (protected)
        Route::prefix('variants')->middleware('permission:can_edit_products')->group(function () {
            Route::get('/', [VariantController::class, 'index']);
            Route::post('/', [VariantController::class, 'store']);
            Route::get('/{variant}', [VariantController::class, 'show']);
            Route::put('/{variant}', [VariantController::class, 'update']);
            Route::delete('/{variant}', [VariantController::class, 'destroy']);
            Route::post('/{variant}/generate-barcode', [VariantController::class, 'generateBarcode']);
        });

        // Branch Product routes (protected)
        Route::prefix('branch-products')->middleware('permission:can_view_inventory_levels')->group(function () {
            Route::get('/', [BranchProductController::class, 'index']);
            Route::post('/toggle-status', [BranchProductController::class, 'toggleStatus'])->middleware('permission:can_edit_products');
            Route::post('/add-stock', [BranchProductController::class, 'addStock'])->middleware('permission:can_perform_stock_adjustments');
            Route::get('/stocks', [BranchProductController::class, 'getStocks']);
            Route::put('/stocks/{stock}', [BranchProductController::class, 'updateStock'])->middleware('permission:can_perform_stock_adjustments');
            Route::delete('/stocks/{stock}', [BranchProductController::class, 'destroyStock'])->middleware('permission:can_perform_stock_adjustments');
        });

        // Unit of Measure routes (protected)
        Route::prefix('units-of-measure')->group(function () {
            Route::get('/', [UnitOfMeasureController::class, 'index'])->middleware('permission:can_view_units_of_measure');
            Route::post('/', [UnitOfMeasureController::class, 'store'])->middleware('permission:can_edit_units_of_measure');
            Route::get('/{unitOfMeasure}', [UnitOfMeasureController::class, 'show'])->middleware('permission:can_view_units_of_measure');
            Route::put('/{unitOfMeasure}', [UnitOfMeasureController::class, 'update'])->middleware('permission:can_edit_units_of_measure');
            Route::delete('/{unitOfMeasure}', [UnitOfMeasureController::class, 'destroy'])->middleware('permission:can_delete_units_of_measure');
        });

        // Supplier routes (protected)
        Route::prefix('suppliers')->group(function () {
            Route::get('/', [SupplierController::class, 'index'])->middleware('permission:can_view_suppliers');
            Route::post('/', [SupplierController::class, 'store'])->middleware('permission:can_edit_suppliers');
            Route::get('/{supplier}', [SupplierController::class, 'show'])->middleware('permission:can_view_suppliers');
            Route::put('/{supplier}', [SupplierController::class, 'update'])->middleware('permission:can_edit_suppliers');
            Route::delete('/{supplier}', [SupplierController::class, 'destroy'])->middleware('permission:can_delete_suppliers');
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
        Route::prefix('expense-categories')->group(function () {
            Route::get('/', [ExpenseCategoryController::class, 'index'])->middleware('permission:can_view_expenses');
            Route::post('/', [ExpenseCategoryController::class, 'store'])->middleware('permission:can_edit_expenses');
            Route::get('/{expenseCategory}', [ExpenseCategoryController::class, 'show'])->middleware('permission:can_view_expenses');
            Route::put('/{expenseCategory}', [ExpenseCategoryController::class, 'update'])->middleware('permission:can_edit_expenses');
            Route::delete('/{expenseCategory}', [ExpenseCategoryController::class, 'destroy'])->middleware('permission:can_delete_expenses');
        });

        // Expense routes (protected)
        Route::prefix('expenses')->group(function () {
            Route::get('/', [ExpenseController::class, 'index'])->middleware('permission:can_view_expenses');
            Route::post('/', [ExpenseController::class, 'store'])->middleware('permission:can_edit_expenses');
            Route::get('/{expense}', [ExpenseController::class, 'show'])->middleware('permission:can_view_expenses');
            Route::put('/{expense}', [ExpenseController::class, 'update'])->middleware('permission:can_edit_expenses');
            Route::delete('/{expense}', [ExpenseController::class, 'destroy'])->middleware('permission:can_delete_expenses');
        });

        // Purchase Order routes (protected)
        Route::prefix('purchase-orders')->group(function () {
            Route::get('/', [PurchaseOrderController::class, 'index'])->middleware('permission:can_view_purchase_orders');
            Route::post('/', [PurchaseOrderController::class, 'store'])->middleware('permission:can_edit_purchase_orders');
            Route::get('/{purchaseOrder}', [PurchaseOrderController::class, 'show'])->middleware('permission:can_view_purchase_orders');
            Route::put('/{purchaseOrder}', [PurchaseOrderController::class, 'update'])->middleware('permission:can_edit_purchase_orders');
            Route::delete('/{purchaseOrder}', [PurchaseOrderController::class, 'destroy'])->middleware('permission:can_delete_purchase_orders');
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
        Route::prefix('stock-transfers')->group(function () {
            Route::get('/', [StockTransferController::class, 'index'])->middleware('permission:can_view_stock_transfers');
            Route::post('/', [StockTransferController::class, 'store'])->middleware('permission:can_edit_stock_transfers');
            Route::get('/{stockTransfer}', [StockTransferController::class, 'show'])->middleware('permission:can_view_stock_transfers');
            Route::put('/{stockTransfer}', [StockTransferController::class, 'update'])->middleware('permission:can_edit_stock_transfers');
            Route::delete('/{stockTransfer}', [StockTransferController::class, 'destroy'])->middleware('permission:can_delete_stock_transfers');
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
            Route::post('/', [RoleController::class, 'store'])->middleware('permission:can_edit_roles');
            Route::get('/{role}', [RoleController::class, 'show'])->middleware('permission:can_view_roles');
            Route::put('/{role}', [RoleController::class, 'update'])->middleware('permission:can_edit_roles');
            Route::delete('/{role}', [RoleController::class, 'destroy'])->middleware('permission:can_delete_roles');
        });

        // Billing Counter routes (protected)
        Route::prefix('billing-counters')->group(function () {
            Route::get('/', [BillingCounterController::class, 'index'])->middleware('permission:can_view_counters');
            Route::post('/', [BillingCounterController::class, 'store'])->middleware('permission:can_edit_counters');
            Route::get('/{billingCounter}', [BillingCounterController::class, 'show'])->middleware('permission:can_view_counters');
            Route::put('/{billingCounter}', [BillingCounterController::class, 'update'])->middleware('permission:can_edit_counters');
            Route::delete('/{billingCounter}', [BillingCounterController::class, 'destroy'])->middleware('permission:can_delete_counters');
        });

        // Branch routes (protected)
        Route::prefix('branches')->group(function () {
            Route::get('/', [BranchController::class, 'index'])->middleware('permission:can_view_branches');
            Route::post('/', [BranchController::class, 'store'])->middleware('permission:can_edit_branches');
            Route::get('/{branch}', [BranchController::class, 'show'])->middleware('permission:can_view_branches');
            Route::put('/{branch}', [BranchController::class, 'update'])->middleware('permission:can_edit_branches');
            Route::delete('/{branch}', [BranchController::class, 'destroy'])->middleware('permission:can_delete_branches');
        });

        // Cash Register Session routes (protected)
        Route::prefix('cash-register-sessions')->group(function () {
            Route::get('/active', [CashRegisterSessionController::class, 'activeSession']);
            
            Route::middleware('permission:can_open_close_cash_register')->group(function () {
                Route::get('/', [CashRegisterSessionController::class, 'index']);
                Route::post('/open', [CashRegisterSessionController::class, 'openSession']);
                Route::post('/{cashRegisterSession}/close', [CashRegisterSessionController::class, 'closeSession']);
                Route::get('/{cashRegisterSession}', [CashRegisterSessionController::class, 'show']);
                Route::put('/{cashRegisterSession}', [CashRegisterSessionController::class, 'update']);
                Route::delete('/{cashRegisterSession}', [CashRegisterSessionController::class, 'destroy']);
            });
        });

        // Cash Transaction routes (protected)
        Route::prefix('cash-transactions')->group(function () {
            Route::get('/', [CashTransactionController::class, 'index'])->middleware('permission:can_approve_cash_transactions');
            Route::post('/', [CashTransactionController::class, 'store'])->middleware('permission:can_request_cash_transactions');
            Route::get('/{cashTransaction}', [CashTransactionController::class, 'show'])->middleware('permission:can_approve_cash_transactions');
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
        Route::prefix('payment-methods')->group(function () {
            Route::get('/', [PaymentMethodController::class, 'index'])->middleware('permission:can_view_payment_methods');
            Route::post('/', [PaymentMethodController::class, 'store'])->middleware('permission:can_edit_payment_methods');
            Route::get('/{paymentMethod}', [PaymentMethodController::class, 'show'])->middleware('permission:can_view_payment_methods');
            Route::put('/{paymentMethod}', [PaymentMethodController::class, 'update'])->middleware('permission:can_edit_payment_methods');
            Route::delete('/{paymentMethod}', [PaymentMethodController::class, 'destroy'])->middleware('permission:can_delete_payment_methods');
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
        Route::prefix('memberships')->group(function () {
            Route::get('/', [MembershipController::class, 'index'])->middleware('permission:can_view_roles|can_view_users');
            Route::post('/', [MembershipController::class, 'store'])->middleware('permission:can_edit_users');
            Route::get('/{membership}', [MembershipController::class, 'show'])->middleware('permission:can_view_roles|can_view_users');
            Route::put('/{membership}', [MembershipController::class, 'update'])->middleware('permission:can_edit_users');
            Route::delete('/{membership}', [MembershipController::class, 'destroy'])->middleware('permission:can_delete_users');
        });

        // User Branch Assignment routes (protected)
        Route::prefix('user-branch-assignments')->group(function () {
            Route::get('/', [UserBranchAssignmentController::class, 'index'])->middleware('permission:can_view_users');
            Route::post('/', [UserBranchAssignmentController::class, 'store'])->middleware('permission:can_edit_users');
            Route::get('/{userBranchAssignment}', [UserBranchAssignmentController::class, 'show'])->middleware('permission:can_view_users');
            Route::put('/{userBranchAssignment}', [UserBranchAssignmentController::class, 'update'])->middleware('permission:can_edit_users');
            Route::delete('/{userBranchAssignment}', [UserBranchAssignmentController::class, 'destroy'])->middleware('permission:can_delete_users');
        });

        // Vendor User routes (protected) - explicitly using VendorUserController
        // These routes are usually context-dependent on the vendor passed in query or body
        // but typically 'users' endpoint suggests managing users under the current context
        Route::prefix('users')->group(function () {
            Route::get('/', [\App\Http\Controllers\VendorUserController::class, 'index'])->middleware('permission:can_view_users');
            Route::post('/', [\App\Http\Controllers\VendorUserController::class, 'store'])->middleware('permission:can_edit_users');
            Route::delete('/bulk', [\App\Http\Controllers\VendorUserController::class, 'bulkDestroy'])->middleware('permission:can_delete_users');
            Route::get('/{user}', [\App\Http\Controllers\VendorUserController::class, 'show'])->middleware('permission:can_view_users');
            Route::put('/{user}', [\App\Http\Controllers\VendorUserController::class, 'update'])->middleware('permission:can_edit_users');
            Route::delete('/{user}', [\App\Http\Controllers\VendorUserController::class, 'destroy'])->middleware('permission:can_delete_users');
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