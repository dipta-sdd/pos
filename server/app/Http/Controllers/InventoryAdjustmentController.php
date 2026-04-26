<?php

namespace App\Http\Controllers;

use App\Models\InventoryAdjustment;
use Illuminate\Http\Request;

class InventoryAdjustmentController extends Controller
{
    public function index(Request $request)
    {
        $query = InventoryAdjustment::with(['user', 'variant.product', 'branch']);

        if ($request->has('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->has('branch_ids')) {
            $query->whereIn('branch_id', $request->branch_ids);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('reason', 'like', "%{$search}%");
        }

        $perPage = $request->input('per_page', 10);
        return $query->paginate($perPage);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'branch_id' => 'required|exists:branches,id',
            'variant_id' => 'required|exists:variants,id',
            'quantity' => 'required|numeric|min:0.01',
            'type' => 'required|in:addition,subtraction',
            'reason' => 'required|string',
        ]);

        $validatedData['created_by'] = $request->user()->id;

        $adjustment = DB::transaction(function () use ($validatedData) {
            $adjustment = InventoryAdjustment::create($validatedData);

            // Find or create the ProductStock record for this variant/branch
            $productStock = \App\Models\ProductStock::where('branch_id', $validatedData['branch_id'])
                ->where('variant_id', $validatedData['variant_id'])
                ->first();

            if (!$productStock && $validatedData['type'] === 'addition') {
                // If it doesn't exist and we are adding, we need a base record.
                // We'll use the variant's default prices if available.
                $variant = \App\Models\Variant::find($validatedData['variant_id']);
                $productStock = \App\Models\ProductStock::create([
                    'branch_id' => $validatedData['branch_id'],
                    'product_id' => $variant->product_id,
                    'variant_id' => $variant->id,
                    'quantity' => 0,
                    'cost_price' => $variant->cost_price ?? 0,
                    'selling_price' => $variant->selling_price ?? 0,
                ]);
            }

            if ($productStock) {
                if ($validatedData['type'] === 'addition') {
                    $productStock->increment('quantity', $validatedData['quantity']);
                } else {
                    $productStock->decrement('quantity', $validatedData['quantity']);
                }
            }

            return $adjustment;
        });

        return response()->json($adjustment->load(['user', 'variant.product']), 201);
    }

    public function show(InventoryAdjustment $inventoryAdjustment)
    {
        return $inventoryAdjustment->load(['user', 'variant.product']);
    }

    public function update(Request $request, InventoryAdjustment $inventoryAdjustment)
    {
        $validatedData = $request->validate([
            'reason' => 'string',
            'quantity' => 'numeric|min:0.01',
            'type' => 'in:addition,subtraction',
        ]);

        $inventoryAdjustment->update($validatedData);

        return response()->json($inventoryAdjustment->load(['user', 'variant.product']));
    }

    public function destroy(InventoryAdjustment $inventoryAdjustment)
    {
        $inventoryAdjustment->delete();

        return response()->json(null, 204);
    }
}
