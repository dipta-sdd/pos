<?php

namespace App\Http\Controllers;

use App\Models\SaleReturn;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleReturnController extends Controller
{
    public function index()
    {
        return SaleReturn::with('returnItems')->paginate();
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'original_sale_id' => 'required|exists:sales,id',
            'user_id' => 'required|exists:users,id',
            'reason' => 'nullable|string',
            'refund_type' => 'required|in:cash,store_credit',
            'refund_amount' => 'required|numeric|min:0',
            'vendor_id' => 'required|exists:vendors,id',
            'branch_id' => 'required|exists:branches,id',
            'items' => 'required|array',
            'items.*.sale_item_id' => 'required|exists:sale_items,id',
            'items.*.quantity_returned' => 'required|numeric|min:1',
        ]);

        $validatedData['created_by'] = $request->user()->id;
        $validatedData['updated_by'] = $request->user()->id;

        $saleReturn = DB::transaction(function () use ($validatedData, $request) {
            $saleReturn = SaleReturn::create($validatedData);
            $saleReturn->returnItems()->createMany($request->items);
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
