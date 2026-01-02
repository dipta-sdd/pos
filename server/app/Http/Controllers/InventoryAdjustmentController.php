<?php

namespace App\Http\Controllers;

use App\Models\InventoryAdjustment;
use Illuminate\Http\Request;

class InventoryAdjustmentController extends Controller
{
    public function index()
    {
        return InventoryAdjustment::paginate();
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'inventory_batch_id' => 'required|exists:inventory_batches,id',
            'user_id' => 'required|exists:users,id',
            'quantity_changed' => 'required|numeric',
            'reason' => 'required|string',
        ]);

        $validatedData['created_by'] = $request->user()->id;
        $validatedData['updated_by'] = $request->user()->id;

        $inventoryAdjustment = InventoryAdjustment::create($validatedData);

        return response()->json($inventoryAdjustment, 201);
    }

    public function show(InventoryAdjustment $inventoryAdjustment)
    {
        return $inventoryAdjustment;
    }

    public function update(Request $request, InventoryAdjustment $inventoryAdjustment)
    {
        $validatedData = $request->validate([
            'quantity_changed' => 'numeric',
            'reason' => 'string',
        ]);

        $validatedData['updated_by'] = $request->user()->id;

        $inventoryAdjustment->update($validatedData);

        return response()->json($inventoryAdjustment);
    }

    public function destroy(InventoryAdjustment $inventoryAdjustment)
    {
        $inventoryAdjustment->delete();

        return response()->json(null, 204);
    }
}
