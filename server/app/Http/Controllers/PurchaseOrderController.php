<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseOrderController extends Controller
{
    public function index()
    {
        return PurchaseOrder::with('purchaseOrderItems')->paginate();
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'branch_id' => 'required|exists:branches,id',
            'status' => 'required|in:pending,received,cancelled',
            'total_amount' => 'required|numeric|min:0',
            'paid_amount' => 'numeric|min:0',
            'order_date' => 'required|date',
            'expected_delivery_date' => 'nullable|date|after_or_equal:order_date',
            'vendor_id' => 'required|exists:vendors,id',
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.variant_id' => 'nullable|exists:variants,id',
            'items.*.quantity_ordered' => 'required|numeric|min:1',
            'items.*.unit_cost' => 'required|numeric|min:0',
        ]);

        $validatedData['created_by'] = $request->user()->id;
        $validatedData['updated_by'] = $request->user()->id;

        $purchaseOrder = DB::transaction(function () use ($validatedData, $request) {
            $purchaseOrder = PurchaseOrder::create($validatedData);
            $purchaseOrder->purchaseOrderItems()->createMany($request->items);
            return $purchaseOrder;
        });

        return response()->json($purchaseOrder->load('purchaseOrderItems'), 201);
    }

    public function show(PurchaseOrder $purchaseOrder)
    {
        return $purchaseOrder->load('purchaseOrderItems');
    }

    public function update(Request $request, PurchaseOrder $purchaseOrder)
    {
        $validatedData = $request->validate([
            'supplier_id' => 'exists:suppliers,id',
            'branch_id' => 'exists:branches,id',
            'status' => 'in:pending,received,cancelled',
            'total_amount' => 'numeric|min:0',
            'paid_amount' => 'numeric|min:0',
            'order_date' => 'date',
            'expected_delivery_date' => 'nullable|date|after_or_equal:order_date',
            'items' => 'sometimes|array',
            'items.*.id' => 'sometimes|exists:purchase_order_items,id',
            'items.*.product_id' => 'required_with:items|exists:products,id',
            'items.*.variant_id' => 'nullable|exists:variants,id',
            'items.*.quantity_ordered' => 'required_with:items|numeric|min:1',
            'items.*.unit_cost' => 'required_with:items|numeric|min:0',
        ]);

        $validatedData['updated_by'] = $request->user()->id;

        DB::transaction(function () use ($validatedData, $request, $purchaseOrder) {
            $purchaseOrder->update($validatedData);

            if ($request->has('items')) {
                $itemIds = [];
                foreach ($request->items as $itemData) {
                    if (isset($itemData['id'])) {
                        $item = $purchaseOrder->purchaseOrderItems()->find($itemData['id']);
                        if ($item) {
                            $item->update($itemData);
                            $itemIds[] = $item->id;
                        }
                    } else {
                        $item = $purchaseOrder->purchaseOrderItems()->create($itemData);
                        $itemIds[] = $item->id;
                    }
                }
                $purchaseOrder->purchaseOrderItems()->whereNotIn('id', $itemIds)->delete();
            }
        });

        return response()->json($purchaseOrder->load('purchaseOrderItems'));
    }

    public function destroy(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->delete();

        return response()->json(null, 204);
    }
}
