<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function sales(Request $request)
    {
        $vendorId = $request->vendor_id;
        $branchIds = $request->branch_ids;
        $startDate = $request->start_date ? Carbon::parse($request->start_date) : Carbon::today()->subDays(30);
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : Carbon::today();

        // 1. Sales over time (Daily)
        $salesQuery = Sale::where('vendor_id', $vendorId)
            ->whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->where('status', '!=', 'void');

        if (!empty($branchIds)) {
            $salesQuery->whereIn('branch_id', $branchIds);
        }

        $salesOverTime = $salesQuery->selectRaw('DATE(created_at) as date, sum(total_amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // 2. Top Products
        $topProductsQuery = SaleItem::whereHas('sale', function ($q) use ($vendorId, $startDate, $endDate, $branchIds) {
                $q->where('vendor_id', $vendorId)
                  ->whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
                  ->where('status', '!=', 'void');
                if (!empty($branchIds)) {
                    $q->whereIn('branch_id', $branchIds);
                }
            })
            ->with(['variant.product']);

        $topProducts = $topProductsQuery->selectRaw('variant_id, sum(quantity) as total_qty, sum(total_amount) as total_revenue')
            ->groupBy('variant_id')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get();

        // 3. Sales by Category
        $salesByCategoryQuery = SaleItem::whereHas('sale', function ($q) use ($vendorId, $startDate, $endDate, $branchIds) {
                $q->where('vendor_id', $vendorId)
                  ->whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
                  ->where('status', '!=', 'void');
                if (!empty($branchIds)) {
                    $q->whereIn('branch_id', $branchIds);
                }
            })
            ->join('variants', 'sale_items.variant_id', '=', 'variants.id')
            ->join('products', 'variants.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id');

        $salesByCategory = $salesByCategoryQuery->selectRaw('categories.name as category_name, sum(sale_items.total_amount) as total')
            ->groupBy('categories.name')
            ->get();

        // 4. Tax Summary
        $taxSummaryQuery = Sale::where('vendor_id', $vendorId)
            ->whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->where('status', '!=', 'void');

        if (!empty($branchIds)) {
            $taxSummaryQuery->whereIn('branch_id', $branchIds);
        }

        $taxSummary = $taxSummaryQuery->selectRaw('sum(tax_amount) as total_tax, sum(total_amount) as total_sales')
            ->first();

        return response()->json([
            'sales_over_time' => $salesOverTime,
            'top_products' => $topProducts,
            'sales_by_category' => $salesByCategory,
            'tax_summary' => $taxSummary,
        ]);
    }

    public function financialLedger(Request $request)
    {
        $vendorId = $request->vendor_id;
        $branchIds = $request->branch_ids;
        $startDate = $request->start_date ? Carbon::parse($request->start_date) : Carbon::today()->subDays(30);
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : Carbon::today();

        // 1. Revenue by Payment Method
        $revenueByPaymentMethodQuery = \App\Models\SalePayment::whereHas('sale', function ($q) use ($vendorId, $startDate, $endDate, $branchIds) {
                $q->where('vendor_id', $vendorId)
                  ->whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
                  ->where('status', '!=', 'void');
                if (!empty($branchIds)) {
                    $q->whereIn('branch_id', $branchIds);
                }
            })
            ->join('payment_methods', 'sale_payments.payment_method_id', '=', 'payment_methods.id');

        $revenueByPaymentMethod = $revenueByPaymentMethodQuery->selectRaw('payment_methods.name, sum(sale_payments.amount) as total')
            ->groupBy('payment_methods.name')
            ->get();

        // 2. Expenses by Category
        $expensesQuery = \App\Models\Expense::where('vendor_id', $vendorId)
            ->whereBetween('expense_date', [$startDate->toDateString(), $endDate->toDateString()]);

        if (!empty($branchIds)) {
            $expensesQuery->whereIn('branch_id', $branchIds);
        }

        $expensesByCategory = $expensesQuery->join('expense_categories', 'expenses.expense_category_id', '=', 'expense_categories.id')
            ->selectRaw('expense_categories.name, sum(expenses.amount) as total')
            ->groupBy('expense_categories.name')
            ->get();

        // 3. Daily Net Cash Flow (Simplified: Daily Sales - Daily Expenses)
        $dailySalesQuery = Sale::where('vendor_id', $vendorId)
            ->whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->where('status', '!=', 'void');

        if (!empty($branchIds)) {
            $dailySalesQuery->whereIn('branch_id', $branchIds);
        }

        $dailyRevenue = $dailySalesQuery->selectRaw('DATE(created_at) as date, sum(total_amount) as total')
            ->groupBy('date')
            ->get()
            ->pluck('total', 'date');

        $dailyExpensesQuery = \App\Models\Expense::where('vendor_id', $vendorId)
            ->whereBetween('expense_date', [$startDate->toDateString(), $endDate->toDateString()]);

        if (!empty($branchIds)) {
            $dailyExpensesQuery->whereIn('branch_id', $branchIds);
        }

        $dailyExpenses = $dailyExpensesQuery->selectRaw('expense_date as date, sum(amount) as total')
            ->groupBy('date')
            ->get()
            ->pluck('total', 'date');

        $dates = $dailyRevenue->keys()->concat($dailyExpenses->keys())->unique()->sort();
        $dailyProfit = $dates->map(function($date) use ($dailyRevenue, $dailyExpenses) {
            $rev = $dailyRevenue->get($date, 0);
            $exp = $dailyExpenses->get($date, 0);
            return [
                'date' => $date,
                'revenue' => $rev,
                'expense' => $exp,
                'profit' => $rev - $exp
            ];
        })->values();

        return response()->json([
            'revenue_by_payment_method' => $revenueByPaymentMethod,
            'expenses_by_category' => $expensesByCategory,
            'daily_profit' => $dailyProfit,
        ]);
    }

    public function inventorySummary(Request $request)
    {
        $vendorId = $request->vendor_id;
        $branchIds = $request->branch_ids;

        // 1. Stock Value by Category
        $stockValueQuery = \App\Models\ProductStock::whereHas('branch', function($q) use ($vendorId, $branchIds) {
                $q->where('vendor_id', $vendorId);
                if (!empty($branchIds)) {
                    $q->whereIn('id', $branchIds);
                }
            })
            ->join('products', 'product_stocks.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id');

        $stockValueByCategory = $stockValueQuery->selectRaw('categories.name as category_name, sum(product_stocks.quantity * product_stocks.cost_price) as total_value')
            ->groupBy('categories.name')
            ->get();

        // 2. Low Stock Items
        $lowStockQuery = \App\Models\ProductStock::whereHas('branch', function($q) use ($vendorId, $branchIds) {
                $q->where('vendor_id', $vendorId);
                if (!empty($branchIds)) {
                    $q->whereIn('id', $branchIds);
                }
            })
            ->with(['variant.product', 'branch'])
            ->where('quantity', '<=', 5);

        $lowStockItems = $lowStockQuery->limit(10)->get();

        // 3. Expiring Soon (Next 30 days)
        $expiringSoon = \App\Models\ProductStock::whereHas('product', function($q) use ($vendorId) {
                $q->where('vendor_id', $vendorId);
            })
            ->whereNotNull('expiry_date')
            ->whereBetween('expiry_date', [Carbon::now(), Carbon::now()->addDays(30)])
            ->where('quantity', '>', 0)
            ->with(['product', 'variant'])
            ->get();

        return response()->json([
            'stock_value_by_category' => $stockValueByCategory,
            'low_stock_items' => $lowStockItems,
            'expiring_soon' => $expiringSoon,
        ]);
    }
}
