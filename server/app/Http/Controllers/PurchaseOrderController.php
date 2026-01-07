<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchaseOrder::with('purchaseOrderItems');

        if ($request->has('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }

        if ($request->has('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $perPage = $request->input('per_page', 15);
        return $query->paginate($perPage);
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
            'items.*.variant_id' => 'required|exists:variants,id',
            'items.*.unit_of_measure_id' => 'nullable|exists:units_of_measure,id',
            'items.*.quantity_ordered' => 'required|numeric|min:1',
            'items.*.quantity_received' => 'numeric|min:0',
            'items.*.unit_cost' => 'required|numeric|min:0',
            'items.*.total_cost' => 'required|numeric|min:0',
            'items.*.notes' => 'nullable|string',
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
            'items.*.variant_id' => 'required_with:items|exists:variants,id',
            'items.*.unit_of_measure_id' => 'nullable|exists:units_of_measure,id',
            'items.*.quantity_ordered' => 'required_with:items|numeric|min:1',
            'items.*.quantity_received' => 'numeric|min:0',
            'items.*.unit_cost' => 'required_with:items|numeric|min:0',
            'items.*.total_cost' => 'required_with:items|numeric|min:0',
            'items.*.notes' => 'nullable|string',
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
