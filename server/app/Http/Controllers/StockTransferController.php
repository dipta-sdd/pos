<?php

namespace App\Http\Controllers;

use App\Models\StockTransfer;
use App\Models\StockTransferItem;
use App\Models\Variant;
use App\Models\ProductStock;
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

    public function searchVariants(Request $request)
    {
        $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'branch_id' => 'nullable|exists:branches,id',
        ]);

        $vendorId = $request->vendor_id;
        $branchId = $request->branch_id;

        $query = Variant::select([
            'variants.id as id',
            'variants.name as variant_name',
            'variants.value as variant_value',
            'variants.sku',
            'variants.barcode',
            'products.id as product_id',
            'products.name as product_name',
            'units_of_measure.abbreviation as unit_abbreviation'
        ])
            ->join('products', 'variants.product_id', '=', 'products.id')
            ->leftJoin('units_of_measure', 'variants.unit_of_measure_id', '=', 'units_of_measure.id')
            ->where('products.vendor_id', $vendorId);

        if ($branchId) {
            $query->addSelect([
                DB::raw('COALESCE(SUM(product_stocks.quantity), 0) as total_quantity'),
            ])
                ->leftJoin('product_stocks', function ($join) use ($branchId) {
                    $join->on('variants.id', '=', 'product_stocks.variant_id')
                        ->where('product_stocks.branch_id', '=', $branchId);
                })
                ->groupBy(
                    'variants.id',
                    'variants.name',
                    'variants.value',
                    'variants.sku',
                    'variants.barcode',
                    'products.id',
                    'products.name',
                    'units_of_measure.abbreviation'
                );
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('products.name', 'like', "%{$search}%")
                    ->orWhere('variants.value', 'like', "%{$search}%")
                    ->orWhere('variants.sku', 'like', "%{$search}%")
                    ->orWhere('variants.barcode', 'like', "%{$search}%");
            });
        }

        return response()->json($query->limit(20)->get());
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'from_branch_id' => 'required|exists:branches,id,vendor_id,' . $request->vendor_id,
            'to_branch_id' => 'required|different:from_branch_id|exists:branches,id,vendor_id,' . $request->vendor_id,
            'status' => 'required|in:draft,pending_approval,in_transit,completed,cancelled,rejected,requested',
            'notes' => 'nullable|string',
            'vendor_id' => 'required|exists:vendors,id',
            'items' => 'required|array',
            'items.*.product_stocks_id' => 'nullable|exists:product_stocks,id',
            'items.*.variant_id' => 'nullable|exists:variants,id',
            'items.*.unit_of_measure_id' => 'nullable|exists:units_of_measure,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.approved_quantity' => 'nullable|numeric|min:0',
            'items.*.received_quantity' => 'nullable|numeric|min:0',
            'items.*.cost_price' => 'nullable|numeric|min:0',
            'items.*.selling_price' => 'nullable|numeric|min:0',
            'items.*.expiry_date' => 'nullable|date',
            'items.*.status' => 'nullable|string|in:pending,accepted,in_transit,completed,cancelled,rejected,requested,out_of_stock',
        ]);

        $validatedData['created_by'] = $request->user()->id;
        $validatedData['updated_by'] = $request->user()->id;
        $validatedData['notes'] = $validatedData['notes'] ?? "";

        // Branch Permission Check
        $membership = $request->user()->memberships()->where('vendor_id', $validatedData['vendor_id'])->first();
        $userBranchIds = $membership ? $membership->userBranchAssignments->pluck('branch_id')->toArray() : [];

        if ($validatedData['status'] === 'requested') {
            if (!in_array($validatedData['to_branch_id'], $userBranchIds)) {
                return response()->json(['message' => "You do not have access to the destination branch to make this request"], 403);
            }
        } else {
            if (!in_array($validatedData['from_branch_id'], $userBranchIds)) {
                return response()->json(['message' => "You do not have access to the source branch to initiate this transfer"], 403);
            }
        }

        $stockTransfer = DB::transaction(function () use ($validatedData, $request) {
            $stockTransfer = StockTransfer::create($validatedData);

            foreach ($request->items as $item) {
                $itemData = $item;
                // If it's not a request and product_stocks_id is missing, try to find it
                if (empty($itemData['product_stocks_id']) && $stockTransfer->status !== 'requested') {
                    $stock = ProductStock::where('branch_id', $stockTransfer->from_branch_id)
                        ->where('variant_id', $itemData['variant_id'])
                        ->first();
                    if ($stock) {
                        $itemData['product_stocks_id'] = $stock->id;
                    }
                }
                $stockTransfer->stockTransferItems()->create($itemData);
            }

            return $stockTransfer;
        });

        return response()->json($stockTransfer->load('stockTransferItems'), 201);
    }

    public function show(StockTransfer $stockTransfer)
    {
        return response()->json($stockTransfer->load('stockTransferItems.variant.product', 'stockTransferItems.unitOfMeasure', 'fromBranch', 'toBranch', 'createdBy', 'updatedBy'));
    }

    public function update(Request $request, StockTransfer $stockTransfer)
    {

        $validatedData = $request->validate([
            'from_branch_id' => 'exists:branches,id',
            'to_branch_id' => 'different:from_branch_id|exists:branches,id',
            'status' => 'in:draft,pending,pending_approval,in_transit,completed,cancelled,rejected,requested',
            'notes' => 'nullable|string',
            'items' => 'sometimes|array',
            'items.*.id' => 'sometimes|exists:stock_transfer_items,id',
            'items.*.product_stocks_id' => 'nullable|exists:product_stocks,id',
            'items.*.variant_id' => 'nullable|exists:variants,id',
            'items.*.unit_of_measure_id' => 'nullable|exists:units_of_measure,id',
            'items.*.quantity' => 'required_with:items|numeric|min:0.01',
            'items.*.approved_quantity' => 'nullable|numeric|min:0',
            'items.*.received_quantity' => 'nullable|numeric|min:0',
            'items.*.cost_price' => 'nullable|numeric|min:0',
            'items.*.selling_price' => 'nullable|numeric|min:0',
            'items.*.expiry_date' => 'nullable|date',
            'items.*.status' => 'nullable|string|in:pending,accepted,in_transit,completed,cancelled,rejected,requested,out_of_stock',
        ]);

        $validatedData['updated_by'] = $request->user()->id;
        $validatedData['notes'] = $validatedData['notes'] ?? "";

        // Check if receiver is trying to edit after acceptance
        $membership = $request->user()->memberships()->where('vendor_id', $stockTransfer->vendor_id)->first();
        $userBranchIds = $membership ? $membership->userBranchAssignments->pluck('branch_id')->toArray() : [];
        $isOnlyReceiver = in_array($stockTransfer->to_branch_id, $userBranchIds) && !in_array($stockTransfer->from_branch_id, $userBranchIds);

        if ($isOnlyReceiver && !in_array($stockTransfer->status, ['draft', 'requested'])) {
            return response()->json(['message' => "You cannot edit this transfer after it has been accepted by the sender"], 403);
        }

        DB::transaction(function () use ($validatedData, $request, $stockTransfer) {
            $oldStatus = $stockTransfer->status;
            $newStatus = $validatedData['status'] ?? $oldStatus;

            $stockTransfer->update($validatedData);

            if ($request->has('items')) {
                $itemIds = [];
                foreach ($request->items as $itemData) {
                    // If it's not a request and product_stocks_id is missing, try to find it
                    if (empty($itemData['product_stocks_id']) && $stockTransfer->status !== 'requested') {
                        $stock = ProductStock::where('branch_id', $stockTransfer->from_branch_id)
                            ->where('variant_id', $itemData['variant_id'] ?? null)
                            ->first();
                        if ($stock) {
                            $itemData['product_stocks_id'] = $stock->id;
                        }
                    }

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
                    // 1. Shipped: Deduct from Source (using approved_quantity)
                    if ($newStatus === 'in_transit' && ($oldStatus === 'pending' || $oldStatus === 'accepted')) {
                        $deductQty = $item->approved_quantity ?? $item->quantity;
                        
                        // Fetch stock details to fill missing prices/expiry
                        $sourceStock = \App\Models\ProductStock::where('branch_id', $stockTransfer->from_branch_id)
                            ->where('variant_id', $item->variant_id)
                            ->first();

                        if ($sourceStock) {
                            $itemUpdate = [];
                            if (!$item->cost_price) $itemUpdate['cost_price'] = $sourceStock->cost_price;
                            if (!$item->selling_price) $itemUpdate['selling_price'] = $sourceStock->selling_price;
                            if (!$item->expiry_date) $itemUpdate['expiry_date'] = $sourceStock->expiry_date;
                            
                            if (!empty($itemUpdate)) {
                                $item->update($itemUpdate);
                            }
                        }

                        \App\Models\ProductStock::where('branch_id', $stockTransfer->from_branch_id)
                            ->where('variant_id', $item->variant_id)
                            ->decrement('quantity', $deductQty);
                    }

                    // 2. Received: Add to Destination (using received_quantity)
                    if ($newStatus === 'completed' && $oldStatus === 'in_transit') {
                        $addQty = $item->received_quantity ?? $item->approved_quantity ?? $item->quantity;
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
                                'cost_price' => $item->cost_price ?? $variant->cost_price ?? 0,
                                'selling_price' => $item->selling_price ?? $variant->selling_price ?? 0,
                                'expiry_date' => $item->expiry_date,
                            ]);
                        } else {
                            // Update existing stock info if provided from transfer
                            if ($item->cost_price) $destStock->cost_price = $item->cost_price;
                            if ($item->selling_price) $destStock->selling_price = $item->selling_price;
                            if ($item->expiry_date) $destStock->expiry_date = $item->expiry_date;
                        }
                        $destStock->increment('quantity', $addQty);
                    }

                    // 3. Cancelled (if already shipped): Replenish Source
                    if ($newStatus === 'cancelled' && $oldStatus === 'in_transit') {
                        $replenishQty = $item->approved_quantity ?? $item->quantity;
                        \App\Models\ProductStock::where('branch_id', $stockTransfer->from_branch_id)
                            ->where('variant_id', $item->variant_id)
                            ->increment('quantity', $replenishQty);
                    }
                }
            }
        });

        return response()->json($stockTransfer->load('stockTransferItems.unitOfMeasure'));
    }

    public function destroy(StockTransfer $stockTransfer)
    {
        $stockTransfer->delete();

        return response()->json(null, 204);
    }

    public function updateTransferStatus(Request $request, StockTransfer $stockTransfer)
    {
        $request->validate([
            'status' => 'required|string|in:pending,accepted,in_transit,completed,cancelled,rejected,requested',
        ]);

        $newStatus = $request->status;
        $membership = $request->user()->memberships()->where('vendor_id', $stockTransfer->vendor_id)->first();
        $userBranchIds = $membership ? $membership->userBranchAssignments->pluck('branch_id')->toArray() : [];

        // Enforcement Logic
        // Sender Actions (Source Branch)
        $senderActions = ['accepted', 'rejected', 'in_transit', 'out_of_stock'];
        if (in_array($newStatus, $senderActions)) {
            if (!in_array($stockTransfer->from_branch_id, $userBranchIds)) {
                return response()->json(['message' => "Only the sending branch can perform this action ({$newStatus})"], 403);
            }
        }

        // Receiver Actions (Destination Branch)
        $receiverActions = ['completed', 'requested'];
        if (in_array($newStatus, $receiverActions)) {
            if (!in_array($stockTransfer->to_branch_id, $userBranchIds)) {
                return response()->json(['message' => "Only the receiving branch can perform this action ({$newStatus})"], 403);
            }
        }

        // Specific Rule: Receiver cannot cancel after acceptance
        if ($newStatus === 'cancelled') {
            $isOnlyReceiver = in_array($stockTransfer->to_branch_id, $userBranchIds) && !in_array($stockTransfer->from_branch_id, $userBranchIds);
            if ($isOnlyReceiver && !in_array($stockTransfer->status, ['draft', 'requested'])) {
                return response()->json(['message' => "Cannot cancel transfer after it has been accepted by the sender"], 403);
            }
        }


        $stockTransfer->update(['status' => $newStatus]);

        return response()->json(['message' => 'Transfer status updated successfully', 'status' => $newStatus]);
    }
}
