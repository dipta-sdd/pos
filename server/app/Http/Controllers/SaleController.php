<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $query = Sale::with(['saleItems', 'salePayments']);

        if ($request->has('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }

        if ($request->has('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->has('branch_ids')) {
            $query->whereIn('branch_id', $request->branch_ids);
        }

        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search options: by ID or Customer Name override if needed, 
        // but for now simple structure is sufficient.

        $perPage = $request->input('per_page', 10);
        return $query->paginate($perPage);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'sales_person_id' => 'required|exists:users,id',
            'cash_register_session_id' => 'required|exists:cash_register_sessions,id',
            'customer_id' => 'nullable|exists:customers,id',
            'tempCustomer' => 'nullable|array',
            'tempCustomer.name' => 'required_with:tempCustomer|string|max:255',
            'tempCustomer.mobile' => 'nullable|string|max:255',
            'subtotal_amount' => 'required|numeric|min:0',
            'total_discount_amount' => 'numeric|min:0',
            'tax_amount' => 'numeric|min:0',
            'final_amount' => 'required|numeric|min:0',
            'status' => 'required|in:completed,voided',
            'vendor_id' => 'required|exists:vendors,id',
            'items' => 'required|array',
            'items.*.variant_id' => 'required|exists:variants,id',
            'items.*.product_stock_id' => 'nullable|exists:product_stocks,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.sell_price_at_sale' => 'required|numeric|min:0',
            'items.*.discount_amount' => 'numeric|min:0',
            'items.*.tax_amount' => 'numeric|min:0',
            'items.*.tax_rate_applied' => 'numeric|min:0',
            'items.*.line_total' => 'required|numeric|min:0',
            'items.*.unit_of_measure_id' => 'nullable|exists:units_of_measure,id',
            'items.*.other' => 'nullable|array',
            'payments' => 'required|array',
            'payments.*.payment_method_id' => 'required|exists:payment_methods,id',
            'payments.*.amount' => 'required|numeric|min:0',
            'payments.*.amount_received' => 'nullable|numeric|min:0',
            'payments.*.change' => 'nullable|numeric|min:0',
        ]);

        $validatedData['created_by'] = $request->user()->id;
        $validatedData['updated_by'] = $request->user()->id;

        $sale = DB::transaction(function () use ($validatedData, $request) {
            // Handle guest customer creation
            if (empty($validatedData['customer_id']) && !empty($request->tempCustomer['name'])) {
                $customer = \App\Models\Customer::create([
                    'vendor_id' => $validatedData['vendor_id'],
                    'name' => $request->tempCustomer['name'],
                    'phone' => $request->tempCustomer['mobile'] ?? null,
                    'created_by' => $validatedData['created_by'],
                    'updated_by' => $validatedData['updated_by'],
                ]);
                $validatedData['customer_id'] = $customer->id;
            }

            $sale = Sale::create($validatedData);

            // Create sale items with stock deduction and buy_price capture
            foreach ($request->items as $itemData) {
                $buyPrice = 0;

                // Deduct stock if product_stock_id is provided
                if (!empty($itemData['product_stock_id'])) {
                    $productStock = \App\Models\ProductStock::lockForUpdate()
                        ->find($itemData['product_stock_id']);

                    if ($productStock) {
                        $buyPrice = $productStock->cost_price;
                        $productStock->decrement('quantity', $itemData['quantity']);
                    }
                }

                $sale->saleItems()->create([
                    'variant_id' => $itemData['variant_id'],
                    'product_stock_id' => $itemData['product_stock_id'] ?? null,
                    'quantity' => $itemData['quantity'],
                    'buy_price' => $buyPrice,
                    'sell_price_at_sale' => $itemData['sell_price_at_sale'],
                    'discount_amount' => $itemData['discount_amount'] ?? 0,
                    'tax_amount' => $itemData['tax_amount'] ?? 0,
                    'tax_rate_applied' => $itemData['tax_rate_applied'] ?? 0,
                    'line_total' => $itemData['line_total'],
                    'unit_of_measure_id' => $itemData['unit_of_measure_id'] ?? null,
                    'other' => $itemData['other'] ?? null,
                    'created_by' => $validatedData['created_by'],
                    'updated_by' => $validatedData['updated_by'],
                ]);
            }

            // Create sale payments with full details and update payment method totals
            foreach ($request->payments as $paymentData) {
                $sale->salePayments()->create([
                    'cash_register_session_id' => $validatedData['cash_register_session_id'],
                    'payment_method_id' => $paymentData['payment_method_id'],
                    'amount' => $paymentData['amount'],
                    'amount_received' => $paymentData['amount_received'] ?? $paymentData['amount'],
                    'change' => $paymentData['change'] ?? 0,
                    'created_by' => $validatedData['created_by'],
                ]);

                // Increment total_collected on the payment method
                \App\Models\PaymentMethod::where('id', $paymentData['payment_method_id'])
                    ->increment('total_collected', $paymentData['amount']);
            }

            return $sale;
        });

        // Return enriched response for receipt
        return response()->json(
            $sale->load([
                'saleItems.variant.product',
                'saleItems.variant',
                'salePayments.paymentMethod',
                'customer',
                'branch',
                'salesPerson',
            ]),
            201
        );
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
