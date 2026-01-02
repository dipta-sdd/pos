<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('variants');

        if ($request->has('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $perPage = $request->input('per_page', 15);
        return $query->paginate($perPage);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'vendor_id' => 'required|exists:vendors,id',
            'category_id' => 'nullable|exists:categories,id',
            'unit_of_measure_id' => 'nullable|exists:units_of_measure,id',
            'variants' => 'sometimes|array',
            'variants.*.name' => 'required_with:variants|string|max:255',
            'variants.*.value' => 'required_with:variants|string|max:255',
        ]);

        $validatedData['created_by'] = $request->user()->id;
        $validatedData['updated_by'] = $request->user()->id;

        $product = DB::transaction(function () use ($validatedData, $request) {
            $product = Product::create($validatedData);

            if ($request->has('variants')) {
                foreach ($request->variants as $variantData) {
                    $product->variants()->create($variantData);
                }
            }

            return $product;
        });

        return response()->json($product->load('variants'), 201);
    }

    public function show(Product $product)
    {
        return $product->load('variants');
    }

    public function update(Request $request, Product $product)
    {
        $validatedData = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'unit_of_measure_id' => 'nullable|exists:units_of_measure,id',
            'variants' => 'sometimes|array',
            'variants.*.id' => 'sometimes|exists:variants,id',
            'variants.*.name' => 'required_with:variants|string|max:255',
            'variants.*.value' => 'required_with:variants|string|max:255',
        ]);

        $validatedData['updated_by'] = $request->user()->id;

        DB::transaction(function () use ($validatedData, $request, $product) {
            $product->update($validatedData);

            if ($request->has('variants')) {
                $variantIds = [];
                foreach ($request->variants as $variantData) {
                    if (isset($variantData['id'])) {
                        $variant = $product->variants()->find($variantData['id']);
                        if ($variant) {
                            $variant->update($variantData);
                            $variantIds[] = $variant->id;
                        }
                    } else {
                        $variant = $product->variants()->create($variantData);
                        $variantIds[] = $variant->id;
                    }
                }
                $product->variants()->whereNotIn('id', $variantIds)->delete();
            }
        });

        return response()->json($product->load('variants'));
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json(null, 204);
    }
}
