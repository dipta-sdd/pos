<?php

namespace App\Http\Controllers;

use App\Models\StockTransfer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockTransferController extends Controller
{
    public function index()
    {
        return StockTransfer::with('stockTransferItems')->paginate();
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'from_branch_id' => 'required|exists:branches,id',
            'to_branch_id' => 'required|exists:branches,id',
            'status' => 'required|in:pending,shipped,received,cancelled',
            'notes' => 'nullable|string',
            'vendor_id' => 'required|exists:vendors,id',
            'items' => 'required|array',
            'items.*.branch_product_id' => 'required|exists:branch_products,id',
            'items.*.quantity' => 'required|numeric|min:1',
        ]);

        $validatedData['created_by'] = $request->user()->id;
        $validatedData['updated_by'] = $request->user()->id;

        $stockTransfer = DB::transaction(function () use ($validatedData, $request) {
            $stockTransfer = StockTransfer::create($validatedData);
            $stockTransfer->stockTransferItems()->createMany($request->items);
            return $stockTransfer;
        });

        return response()->json($stockTransfer->load('stockTransferItems'), 201);
    }

    public function show(StockTransfer $stockTransfer)
    {
        return $stockTransfer->load('stockTransferItems');
    }

    public function update(Request $request, StockTransfer $stockTransfer)
    {
        $validatedData = $request->validate([
            'from_branch_id' => 'exists:branches,id',
            'to_branch_id' => 'exists:branches,id',
            'status' => 'in:pending,shipped,received,cancelled',
            'notes' => 'nullable|string',
            'items' => 'sometimes|array',
            'items.*.id' => 'sometimes|exists:stock_transfer_items,id',
            'items.*.branch_product_id' => 'required_with:items|exists:branch_products,id',
            'items.*.quantity' => 'required_with:items|numeric|min:1',
        ]);

        $validatedData['updated_by'] = $request->user()->id;

        DB::transaction(function () use ($validatedData, $request, $stockTransfer) {
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
        });

        return response()->json($stockTransfer->load('stockTransferItems'));
    }

    public function destroy(StockTransfer $stockTransfer)
    {
        $stockTransfer->delete();

        return response()->json(null, 204);
    }
}
