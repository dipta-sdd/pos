<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    public function index()
    {
        return Sale::with(['saleItems', 'salePayments'])->paginate();
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'user_id' => 'required|exists:users,id',
            'billing_counter_id' => 'required|exists:billing_counters,id',
            'cash_register_session_id' => 'required|exists:cash_register_sessions,id',
            'customer_id' => 'nullable|exists:customers,id',
            'subtotal_amount' => 'required|numeric|min:0',
            'total_discount_amount' => 'numeric|min:0',
            'tax_amount' => 'numeric|min:0',
            'final_amount' => 'required|numeric|min:0',
            'status' => 'required|in:completed,voided',
            'vendor_id' => 'required|exists:vendors,id',
            'items' => 'required|array',
            'items.*.branch_product_id' => 'required|exists:branch_products,id',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.sell_price_at_sale' => 'required|numeric|min:0',
            'items.*.discount_amount' => 'numeric|min:0',
            'items.*.tax_amount' => 'numeric|min:0',
            'items.*.line_total' => 'required|numeric|min:0',
            'payments' => 'required|array',
            'payments.*.payment_method_id' => 'required|exists:payment_methods,id',
            'payments.*.amount' => 'required|numeric|min:0',
        ]);

        $validatedData['created_by'] = $request->user()->id;
        $validatedData['updated_by'] = $request->user()->id;

        $sale = DB::transaction(function () use ($validatedData, $request) {
            $sale = Sale::create($validatedData);
            $sale->saleItems()->createMany($request->items);
            $sale->salePayments()->createMany($request->payments);
            return $sale;
        });

        return response()->json($sale->load(['saleItems', 'salePayments']), 201);
    }

    public function show(Sale $sale)
    {
        return $sale->load(['saleItems', 'salePayments']);
    }

    public function update(Request $request, Sale $sale)
    {
        // Generally, sales are not updated, but voided.
        // This method could be used to void a sale.
        $validatedData = $request->validate([
            'status' => 'in:completed,voided',
        ]);

        $validatedData['updated_by'] = $request->user()->id;

        $sale->update($validatedData);

        return response()->json($sale->load(['saleItems', 'salePayments']));
    }

    public function destroy(Sale $sale)
    {
        // Sales should be voided, not deleted.
        // But if we must...
        $sale->delete();

        return response()->json(null, 204);
    }
}
