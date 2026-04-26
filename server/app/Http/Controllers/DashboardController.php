<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Product;
use App\Models\SalePayment;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $vendorId = $request->vendor_id;
        $branchIds = $request->branch_ids;
        $today = Carbon::today();
        
        $vendor = \App\Models\Vendor::find($vendorId);
        $currencySymbol = $vendor?->settings['currency_symbol'] ?? '$';

        $salesQuery = Sale::where('vendor_id', $vendorId)
            ->whereDate('created_at', $today)
            ->where('status', '!=', 'void');

        $expensesQuery = \App\Models\Expense::where('vendor_id', $vendorId)
            ->whereDate('date', $today);

        $recentSalesQuery = Sale::with(['customer'])
            ->where('vendor_id', $vendorId)
            ->orderBy('created_at', 'desc');

        if (!empty($branchIds)) {
            $salesQuery->whereIn('branch_id', $branchIds);
            $expensesQuery->whereIn('branch_id', $branchIds);
            $recentSalesQuery->whereIn('branch_id', $branchIds);
        }

        // 1. Today's Sales Total
        $todaySales = $salesQuery->sum('final_amount');

        // 2. Total Products
        $totalProducts = Product::where('vendor_id', $vendorId)->count();

        // 3. Today's Transactions Count
        $todayTransactions = $salesQuery->count();

        // 4. Recent Activities (Merged Sales & Expenses)
        $recentSales = $recentSalesQuery->limit(5)->get()
            ->map(fn($item) => [
                'id' => $item->id,
                'type' => 'sale',
                'title' => 'Sale #' . $item->id,
                'description' => 'Customer: ' . ($item->customer?->name ?? 'Guest'),
                'amount' => $item->final_amount,
                'status' => $item->status,
                'date' => $item->created_at,
            ]);

        $recentExpensesQuery = \App\Models\Expense::with(['expense_category'])
            ->where('vendor_id', $vendorId)
            ->orderBy('date', 'desc');

        if (!empty($branchIds)) {
            $recentExpensesQuery->whereIn('branch_id', $branchIds);
        }

        $recentExpenses = $recentExpensesQuery->limit(5)->get()
            ->map(fn($item) => [
                'id' => $item->id,
                'type' => 'expense',
                'title' => 'Expense: ' . ($item->expense_category?->name ?? 'Other'),
                'description' => $item->description,
                'amount' => $item->amount,
                'status' => 'paid',
                'date' => $item->date,
            ]);

        $recentActivity = $recentSales->concat($recentExpenses)
            ->sortByDesc('date')
            ->values()
            ->take(8);

        // 5. Today's Expenses Total
        $todayExpenses = $expensesQuery->sum('amount');

        // 6. Sales by Payment Method (Today)
        $paymentSummaryQuery = SalePayment::whereHas('sale', function ($q) use ($vendorId, $today, $branchIds) {
                $q->where('vendor_id', $vendorId)
                  ->whereDate('created_at', $today);
                if (!empty($branchIds)) {
                    $q->whereIn('branch_id', $branchIds);
                }
            })
            ->with('paymentMethod')
            ->selectRaw('payment_method_id, sum(amount) as total')
            ->groupBy('payment_method_id');

        $paymentSummary = $paymentSummaryQuery->get();

        // 7. Low Stock Count
        $lowStockQuery = \App\Models\ProductStock::whereHas('branch', function($q) use ($vendorId, $branchIds) {
                $q->where('vendor_id', $vendorId);
                if (!empty($branchIds)) {
                    $q->whereIn('id', $branchIds);
                }
            })
            ->where('quantity', '<=', 10);

        $lowStockCount = $lowStockQuery->count();

        return response()->json([
            'today_sales' => $todaySales,
            'today_expenses' => $todayExpenses,
            'net_income' => $todaySales - $todayExpenses,
            'total_products' => $totalProducts,
            'today_transactions' => $todayTransactions,
            'low_stock_count' => $lowStockCount,
            'recent_sales' => $recentSales, // Keep for backward compatibility
            'recent_activity' => $recentActivity,
            'payment_summary' => $paymentSummary,
            'currency_symbol' => $currencySymbol,
        ]);
    }
}
