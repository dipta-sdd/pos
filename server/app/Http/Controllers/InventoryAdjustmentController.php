<?php

namespace App\Http\Controllers;

use App\Models\InventoryAdjustment;
use Illuminate\Http\Request;

class InventoryAdjustmentController extends Controller
{
    public function index(Request $request)
    {
        $query = InventoryAdjustment::with(['user', 'variant.product']);

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

        $perPage = $request->input('per_page', 15);
        return $query->paginate($perPage);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'variant_id' => 'required|exists:variants,id',
            'quantity' => 'required|numeric|min:0.01',
            'type' => 'required|in:addition,subtraction',
            'reason' => 'required|string',
        ]);

        $validatedData['created_by'] = $request->user()->id;

        $adjustment = InventoryAdjustment::create($validatedData);

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
