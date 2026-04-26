<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Sale;

class SearchController extends Controller
{
    public function globalSearch(Request $request)
    {
        $vendorId = $request->vendor_id;
        $query = $request->query('query');

        if (!$query || strlen($query) < 2) {
            return response()->json([]);
        }

        // 1. Products
        $products = Product::where('vendor_id', $vendorId)
            ->where(function($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('sku', 'like', "%{$query}%");
            })
            ->limit(5)
            ->get()
            ->map(fn($item) => [
                'id' => $item->id,
                'title' => $item->name,
                'subtitle' => 'SKU: ' . ($item->sku ?? 'N/A'),
                'type' => 'product',
                'url' => "/pos/vendor/{$vendorId}/products/{$item->id}"
            ]);

        // 2. Customers
        $customers = Customer::where('vendor_id', $vendorId)
            ->where(function($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('phone', 'like', "%{$query}%")
                  ->orWhere('email', 'like', "%{$query}%");
            })
            ->limit(5)
            ->get()
            ->map(fn($item) => [
                'id' => $item->id,
                'title' => $item->name,
                'subtitle' => $item->phone ?? $item->email ?? 'Customer',
                'type' => 'customer',
                'url' => "/pos/vendor/{$vendorId}/customers"
            ]);

        // 3. Sales
        $sales = Sale::where('vendor_id', $vendorId)
            ->where(function($q) use ($query) {
                $q->where('id', 'like', "%{$query}%")
                  ->orWhere('final_amount', 'like', "%{$query}%");
            })
            ->limit(5)
            ->get()
            ->map(fn($item) => [
                'id' => $item->id,
                'title' => 'Sale #' . $item->id,
                'subtitle' => 'Amount: ' . number_format($item->final_amount, 2),
                'type' => 'sale',
                'url' => "/pos/vendor/{$vendorId}/sales"
            ]);

        return response()->json([
            'results' => $products->concat($customers)->concat($sales)
        ]);
    }
}
