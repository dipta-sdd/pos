<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\BarcodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::selectRaw('products.*, CONCAT(created_by.firstName, " ", created_by.lastName) as created_by_name, CONCAT(updated_by.firstName, " ", updated_by.lastName) as updated_by_name , categories.name as category_name, units_of_measure.name as unit_of_measure_name , units_of_measure.abbreviation as unit_of_measure_abbreviation')
            ->leftJoin('users as created_by', 'products.created_by', '=', 'created_by.id')
            ->leftJoin('users as updated_by', 'products.updated_by', '=', 'updated_by.id')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->leftJoin('units_of_measure', 'products.unit_of_measure_id', '=', 'units_of_measure.id')
            ->where('products.vendor_id', $request->vendor_id);

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('products.name', 'like', "%{$search}%")
                  ->orWhereHas('variants', function ($vq) use ($search) {
                      $vq->where('name', 'like', "%{$search}%")
                         ->orWhere('value', 'like', "%{$search}%")
                         ->orWhere('sku', 'like', "%{$search}%")
                         ->orWhere('barcode', 'like', "%{$search}%");
                  });
            });
        }
        $perPage = $request->input('per_page', 10);
        return $query->paginate($perPage);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'vendor_id' => 'required|exists:vendors,id',
            'category_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|max:2048',
            'unit_of_measure_id' => 'nullable|exists:units_of_measure,id',
            'variants' => 'sometimes|array',
            'variants.*.name' => 'required_with:variants|string|max:255',
            'variants.*.value' => 'required_with:variants|string|max:255',
            'variants.*.sku' => 'nullable|string|max:255',
            'variants.*.barcode' => 'nullable|string|max:255',
            'variants.*.unit_of_measure_id' => 'nullable|exists:units_of_measure,id',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validatedData['image_url'] = '/storage/' . $path;
        }

        $validatedData['created_by'] = $request->user()->id;
        $validatedData['updated_by'] = $request->user()->id;

        $product = DB::transaction(function () use ($validatedData, $request) {
            $product = Product::create($validatedData);
            $barcodeService = app(BarcodeService::class);

            if ($request->has('variants')) {
                foreach ($request->variants as $variantData) {
                    $variant = $product->variants()->create($variantData);
                    // Auto-assign barcode if not provided
                    if (empty($variant->barcode)) {
                        $barcodeService->assignBarcode($variant);
                    }
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
            'image' => 'nullable|image|max:2048',
            'unit_of_measure_id' => 'nullable|exists:units_of_measure,id',
            'variants' => 'sometimes|array',
            'variants.*.id' => 'sometimes|exists:variants,id',
            'variants.*.name' => 'required_with:variants|string|max:255',
            'variants.*.value' => 'required_with:variants|string|max:255',
            'variants.*.sku' => 'nullable|string|max:255',
            'variants.*.barcode' => 'nullable|string|max:255',
            'variants.*.unit_of_measure_id' => 'nullable|exists:units_of_measure,id',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validatedData['image_url'] = '/storage/' . $path;
        }

        $validatedData['updated_by'] = $request->user()->id;

        DB::transaction(function () use ($validatedData, $request, $product) {
            $product->update($validatedData);
            $barcodeService = app(BarcodeService::class);

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
                        // Auto-assign barcode if not provided
                        if (empty($variant->barcode)) {
                            $barcodeService->assignBarcode($variant);
                        }
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
