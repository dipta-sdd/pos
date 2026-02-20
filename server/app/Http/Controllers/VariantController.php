<?php

namespace App\Http\Controllers;

use App\Models\BranchProduct;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\Variant;
use Illuminate\Http\Request;

class VariantController extends Controller
{
    public function index(Request $request)
    {
        $query = ProductStock::selectRaw('product_stocks.*, products.name as product_name, variants.value as variant_value, variants.sku as sku, variants.barcode as barcode')
            ->leftJoin('variants', 'product_stocks.variant_id', '=', 'variants.id')
            ->leftJoin('products', 'product_stocks.product_id', '=', 'products.id')
            ->where('products.vendor_id', $request->vendor_id);

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
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

        if ($request->has('branch_ids')) {
            $branchIds = $request->branch_ids;
            $query->whereIn('branch_id', $branchIds);
        }

        $perPage = $request->input('per_page', 10);
        return $query->paginate($perPage);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'product_id' => 'required|exists:products,id',
            'name' => 'required|string|max:255',
            'value' => 'required|string|max:255',
            'sku' => 'nullable|string|max:255|unique:variants,sku',
            'barcode' => 'nullable|string|max:255|unique:variants,barcode',
            'unit_of_measure_id' => 'nullable|exists:units_of_measure,id',
        ]);

        $validatedData['created_by'] = $request->user()->id;
        $validatedData['updated_by'] = $request->user()->id;

        $variant = Variant::create($validatedData);

        return response()->json($variant, 201);
    }

    public function show(Variant $variant)
    {
        return $variant;
    }

    public function update(Request $request, Variant $variant)
    {
        $validatedData = $request->validate([
            'name' => 'string|max:255',
            'value' => 'string|max:255',
        ]);

        $validatedData['updated_by'] = $request->user()->id;

        $variant->update($validatedData);

        return response()->json($variant);
    }

    public function destroy(Variant $variant)
    {
        $variant->delete();

        return response()->json(null, 204);
    }
}
