<?php

namespace App\Http\Controllers;

use App\Models\StockTransfer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockTransferController extends Controller
{
    public function index(Request $request)
    {
        $query = StockTransfer::with(['fromBranch', 'toBranch']);

        if ($request->has('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }

        if ($request->has('from_branch_id')) {
            $query->where('from_branch_id', $request->from_branch_id);
        }

        if ($request->has('to_branch_id')) {
            $query->where('to_branch_id', $request->to_branch_id);
        }

        if ($request->has('branch_ids')) {
            $branchIds = $request->branch_ids;
            $query->where(function ($q) use ($branchIds) {
                $q->whereIn('from_branch_id', $branchIds)
                    ->orWhereIn('to_branch_id', $branchIds);
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('notes', 'like', "%{$search}%");
            });
        }

        $perPage = $request->input('per_page', 10);
        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'from_branch_id' => 'required|exists:branches,id,vendor_id,' . $request->vendor_id,
            'to_branch_id' => 'required|exists:branches,id,vendor_id,' . $request->vendor_id,
            'status' => 'required|in:draft,pending_approval,in_transit,completed,cancelled,rejected,requested',
            'notes' => 'nullable|string',
            'vendor_id' => 'required|exists:vendors,id',
            'items' => 'required|array',
            'items.*.product_stocks_id' => 'required|exists:product_stocks,id',
            'items.*.variant_id' => 'nullable|exists:variants,id',
            'items.*.unit_of_measure_id' => 'nullable|exists:units_of_measure,id',
            'items.*.quantity' => 'required|numeric|min:1',
        ]);

        $validatedData['created_by'] = $request->user()->id;
        $validatedData['updated_by'] = $request->user()->id;
        $validatedData['notes'] = $validatedData['notes'] ?? "";

        $stockTransfer = DB::transaction(function () use ($validatedData, $request) {
            $stockTransfer = StockTransfer::create($validatedData);
            $stockTransfer->stockTransferItems()->createMany($request->items);
            return $stockTransfer;
        });

        return response()->json($stockTransfer->load('stockTransferItems'), 201);
    }

    public function show(StockTransfer $stockTransfer)
    {
        return response()->json($stockTransfer->load('stockTransferItems'));
    }

    public function update(Request $request, StockTransfer $stockTransfer)
    {
        $validatedData = $request->validate([
            'from_branch_id' => 'exists:branches,id',
            'to_branch_id' => 'exists:branches,id',
            'status' => 'in:draft,pending_approval,in_transit,completed,cancelled,rejected,requested',
            'notes' => 'nullable|string',
            'items' => 'sometimes|array',
            'items.*.id' => 'sometimes|exists:stock_transfer_items,id',
            'items.*.product_stocks_id' => 'required_with:items|exists:product_stocks,id',
            'items.*.variant_id' => 'nullable|exists:variants,id',
            'items.*.unit_of_measure_id' => 'nullable|exists:units_of_measure,id',
            'items.*.quantity' => 'required_with:items|numeric|min:1',
        ]);

        $validatedData['updated_by'] = $request->user()->id;
        $validatedData['notes'] = $validatedData['notes'] ?? "";

        DB::transaction(function () use ($validatedData, $request, $stockTransfer) {
            $oldStatus = $stockTransfer->status;
            $newStatus = $validatedData['status'] ?? $oldStatus;

            $stockTransfer->update($validatedData);

            if ($request->has('items')) {
                $itemIds = [];
                foreach ($request->items as $itemData) {
                    if (isset($itemData['id'])) {
                        $item = $stockTransfer->stockTransferItems()->find($itemData['id']);
                        if ($item) {
                            $item->update($itemData);
                            $itemIds[] = $item->id;
                        }
                    } else {
                        $item = $stockTransfer->stockTransferItems()->create($itemData);
                        $itemIds[] = $item->id;
                    }
                }
                $stockTransfer->stockTransferItems()->whereNotIn('id', $itemIds)->delete();
            }

            // Handle Inventory Movement based on status transition
            if ($oldStatus !== $newStatus) {
                foreach ($stockTransfer->stockTransferItems as $item) {
                    // 1. Shipped: Deduct from Source
                    if ($newStatus === 'shipped' && $oldStatus === 'pending') {
                        \App\Models\ProductStock::where('branch_id', $stockTransfer->from_branch_id)
                            ->where('variant_id', $item->variant_id)
                            ->decrement('quantity', $item->quantity);
                    }

                    // 2. Received: Add to Destination
                    if ($newStatus === 'received' && $oldStatus === 'shipped') {
                        $destStock = \App\Models\ProductStock::where('branch_id', $stockTransfer->to_branch_id)
                            ->where('variant_id', $item->variant_id)
                            ->first();

                        if (!$destStock) {
                            $variant = \App\Models\Variant::find($item->variant_id);
                            $destStock = \App\Models\ProductStock::create([
                                'branch_id' => $stockTransfer->to_branch_id,
                                'product_id' => $variant->product_id,
                                'variant_id' => $variant->id,
                                'quantity' => 0,
                                'cost_price' => $variant->cost_price ?? 0,
                                'selling_price' => $variant->selling_price ?? 0,
                            ]);
                        }
                        $destStock->increment('quantity', $item->quantity);
                    }

                    // 3. Cancelled (if already shipped): Replenish Source
                    if ($newStatus === 'cancelled' && $oldStatus === 'shipped') {
                        \App\Models\ProductStock::where('branch_id', $stockTransfer->from_branch_id)
                            ->where('variant_id', $item->variant_id)
                            ->increment('quantity', $item->quantity);
                    }
                }
            }
        });

        return response()->json($stockTransfer->load('stockTransferItems'));
    }

    public function destroy(StockTransfer $stockTransfer)
    {
        $stockTransfer->delete();

        return response()->json(null, 204);
    }
}
