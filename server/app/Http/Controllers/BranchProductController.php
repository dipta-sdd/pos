<?php

namespace App\Http\Controllers;

use App\Models\BranchProduct;
use App\Models\ProductStock;
use App\Models\Variant;
use App\Models\Product;
use App\Models\UnitOfMeasure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BranchProductController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
        ]);

        $vendorId = $request->vendor_id;
        $branchIds = $request->branch_ids ?? [];
        if (!is_array($branchIds) && $branchIds) {
            $branchIds = [$branchIds];
        }

        $query = Variant::select([
            'variants.id as id',
            'variants.name as variant_name',
            'variants.value as variant_value',
            'variants.sku',
            'variants.barcode',
            'products.id as product_id',
            'products.name as product_name',
            'products.image_url',
            DB::raw('COALESCE(SUM(product_stocks.quantity), 0) as total_quantity'),
        ])
        ->join('products', 'variants.product_id', '=', 'products.id')
        ->where('products.vendor_id', $vendorId)
        ->leftJoin('product_stocks', function ($join) use ($branchIds) {
            $join->on('variants.id', '=', 'product_stocks.variant_id');
            if (!empty($branchIds)) {
                $join->whereIn('product_stocks.branch_id', $branchIds);
            }
        });

        if (!empty($branchIds) && count($branchIds) === 1) {
            $branchId = $branchIds[0];
            $query->addSelect([
                'branch_products.id as branch_product_id',
                'branch_products.is_active',
            ])
            ->leftJoin('branch_products', function ($join) use ($branchId) {
                $join->on('variants.id', '=', 'branch_products.variant_id')
                     ->where('branch_products.branch_id', '=', $branchId);
            });
        } else {
            $query->addSelect([DB::raw('NULL as branch_product_id'), DB::raw('NULL as is_active')]);
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

        $query->groupBy(
            'variants.id',
            'variants.name',
            'variants.value',
            'variants.sku',
            'variants.barcode',
            'products.id',
            'products.name',
            'products.image_url'
        );

        if (!empty($branchIds) && count($branchIds) === 1) {
            $query->groupBy('branch_products.id', 'branch_products.is_active');
        }

        $sortBy = $request->input('sort_by', 'product_name');
        $sortDirection = $request->input('sort_direction', 'asc');

        if ($sortBy === 'stock_quantity') {
            $query->orderBy('total_quantity', $sortDirection);
        } else if ($sortBy === 'product') {
            $query->orderBy('products.name', $sortDirection);
        } else {
            $query->orderBy('variants.id', $sortDirection);
        }

        $perPage = $request->input('per_page', 10);
        return $query->paginate($perPage);
    }

    public function toggleStatus(Request $request)
    {
        $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'required|exists:variants,id',
            'is_active' => 'required|boolean',
        ]);

        $bp = BranchProduct::firstOrNew([
            'branch_id' => $request->branch_id,
            'variant_id' => $request->variant_id
        ]);

        $bp->product_id = $request->product_id;
        $bp->is_active = $request->is_active;

        if (!$bp->exists) {
            $bp->created_by = $request->user()->id;
        }
        $bp->updated_by = $request->user()->id;
        $bp->save();

        return response()->json($bp);
    }

    public function addStock(Request $request)
    {
        $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'required|exists:variants,id',
            'quantity' => 'required|numeric|min:0.01',
            'cost_price' => 'numeric|min:0',
            'selling_price' => 'numeric|min:0',
            'expiry_date' => 'nullable|date',
        ]);

        // Ensure BranchProduct assignment exists
        $bp = BranchProduct::firstOrCreate(
            ['branch_id' => $request->branch_id, 'variant_id' => $request->variant_id],
            [
                'product_id' => $request->product_id,
                'is_active' => true,
                'created_by' => $request->user()->id,
                'updated_by' => $request->user()->id,
            ]
        );
        
        $variant = Variant::find($request->variant_id);
        $product = Product::find($request->product_id);
        
        // Find correct unit
        $unitId = $variant->unit_of_measure_id ?? $product->unit_of_measure_id;
        $unitName = null;
        $unitAbbr = null;
        if ($unitId) {
            $unit = UnitOfMeasure::find($unitId);
            if ($unit) {
                $unitName = $unit->name;
                $unitAbbr = $unit->abbreviation;
            }
        }

        $stock = ProductStock::create([
            'branch_id' => $request->branch_id,
            'product_id' => $request->product_id,
            'variant_id' => $request->variant_id,
            'branch_product_id' => $bp->id,
            'quantity' => $request->quantity,
            'cost_price' => $request->cost_price ?? 0,
            'selling_price' => $request->selling_price ?? 0,
            'expiry_date' => $request->expiry_date,
            'unit_of_measure_name' => $unitName,
            'unit_of_measure_abbreviation' => $unitAbbr,
        ]);

        return response()->json($stock, 201);
    }

    public function getStocks(Request $request)
    {
        $request->validate([
            'variant_id' => 'required|exists:variants,id',
            'branch_ids' => 'nullable|array',
            'branch_ids.*' => 'exists:branches,id',
        ]);

        $query = ProductStock::with('branch')
            ->where('variant_id', $request->variant_id);

        if ($request->has('branch_ids')) {
            $query->whereIn('branch_id', $request->branch_ids);
        }

        return response()->json($query->get());
    }

    public function updateStock(Request $request, ProductStock $stock)
    {
        $validatedData = $request->validate([
            'quantity' => 'numeric|min:0',
            'cost_price' => 'numeric|min:0',
            'selling_price' => 'numeric|min:0',
            'expiry_date' => 'nullable|date',
        ]);

        $stock->update($validatedData);

        return response()->json($stock->load('branch'));
    }

    public function destroyStock(ProductStock $stock)
    {
        $stock->delete();
        return response()->json(null, 204);
    }
}
