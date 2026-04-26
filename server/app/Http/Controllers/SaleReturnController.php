<?php

namespace App\Http\Controllers;

use App\Models\SaleReturn;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleReturnController extends Controller
{
    public function index(Request $request)
    {
        $query = SaleReturn::with('returnItems');

        if ($request->has('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }

        if ($request->has('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->has('branch_ids')) {
            $query->whereIn('branch_id', $request->branch_ids);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reason', 'like', "%{$search}%");
            });
        }

        $perPage = $request->input('per_page', 10);
        return $query->paginate($perPage);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'original_sale_id' => 'required|exists:sales,id',
            'exchange_sale_id' => 'nullable|exists:sales,id',
            'reason' => 'nullable|string',
            'refund_type' => 'required|in:cash_back,store_credit,exchange',
            'refund_amount' => 'required|numeric|min:0',
            'vendor_id' => 'required|exists:vendors,id',
            'branch_id' => 'required|exists:branches,id',
            'items' => 'required|array',
            'items.*.sale_item_id' => 'required|exists:sale_items,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
        ]);

        $validatedData['created_by'] = $request->user()->id;
        $validatedData['updated_by'] = $request->user()->id;

        $saleReturn = DB::transaction(function () use ($validatedData, $request) {
            $saleReturn = SaleReturn::create($validatedData);
            $saleReturn->returnItems()->createMany($request->items);

            // 1. Inventory Replenishment
            foreach ($request->items as $itemData) {
                $saleItem = \App\Models\SaleItem::find($itemData['sale_item_id']);
                if ($saleItem && $saleItem->product_stock_id) {
                    \App\Models\ProductStock::where('id', $saleItem->product_stock_id)
                        ->increment('quantity', $itemData['quantity']);
                } else {
                    // Fallback to variant/branch if sale_item doesn't have stock link
                    \App\Models\ProductStock::where('branch_id', $validatedData['branch_id'])
                        ->where('variant_id', $saleItem->variant_id)
                        ->increment('quantity', $itemData['quantity']);
                }
            }

            // 2. Refund Processing
            $originalSale = \App\Models\Sale::find($validatedData['original_sale_id']);
            
            if ($validatedData['refund_type'] === 'store_credit' && $originalSale->customer_id) {
                $storeCredit = \App\Models\CustomerStoreCredit::firstOrCreate(
                    ['customer_id' => $originalSale->customer_id],
                    [
                        'vendor_id' => $validatedData['vendor_id'],
                        'current_balance' => 0,
                        'created_by' => $validatedData['created_by'],
                        'updated_by' => $validatedData['updated_by'],
                    ]
                );

                $storeCredit->increment('current_balance', $validatedData['refund_amount']);

                \App\Models\CustomerStoreCreditTransaction::create([
                    'store_credit_id' => $storeCredit->id,
                    'amount' => $validatedData['refund_amount'],
                    'type' => 'credit',
                    'referenceable_id' => $saleReturn->id,
                    'referenceable_type' => SaleReturn::class,
                    'created_by' => $validatedData['created_by'],
                ]);
            } elseif ($validatedData['refund_type'] === 'cash_back') {
                // Record cash out in the register session
                $session = \App\Models\CashRegisterSession::where('branch_id', $validatedData['branch_id'])
                    ->where('user_id', $request->user()->id)
                    ->where('status', 'open')
                    ->first();

                if ($session) {
                    \App\Models\CashTransaction::create([
                        'cash_register_session_id' => $session->id,
                        'vendor_id' => $validatedData['vendor_id'],
                        'branch_id' => $validatedData['branch_id'],
                        'amount' => $validatedData['refund_amount'],
                        'type' => 'out',
                        'reason' => 'Sale Return Refund (Cash Back): Sale #' . $originalSale->id,
                        'created_by' => $validatedData['created_by'],
                    ]);
                }
            }

            return $saleReturn;
        });

        return response()->json($saleReturn->load('returnItems'), 201);
    }

    public function show(SaleReturn $saleReturn)
    {
        return $saleReturn->load('returnItems');
    }

    public function update(Request $request, SaleReturn $saleReturn)
    {
        // Generally, returns are not updated.
        // This method could be used to update the reason, for example.
        $validatedData = $request->validate([
            'reason' => 'nullable|string',
        ]);

        $validatedData['updated_by'] = $request->user()->id;

        $saleReturn->update($validatedData);

        return response()->json($saleReturn->load('returnItems'));
    }

    public function destroy(SaleReturn $saleReturn)
    {
        $saleReturn->delete();

        return response()->json(null, 204);
    }
}
