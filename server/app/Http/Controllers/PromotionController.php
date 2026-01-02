<?php

namespace App\Http\Controllers;

use App\Models\Promotion;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    public function index()
    {
        return Promotion::paginate();
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'applies_to' => 'required|in:all_products,specific_product,specific_category',
            'product_id' => 'nullable|exists:products,id',
            'category_id' => 'nullable|exists:categories,id',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
            'vendor_id' => 'required|exists:vendors,id',
            'branch_id' => 'nullable|exists:branches,id',
        ]);

        $validatedData['created_by'] = $request->user()->id;
        $validatedData['updated_by'] = $request->user()->id;

        $promotion = Promotion::create($validatedData);

        return response()->json($promotion, 201);
    }

    public function show(Promotion $promotion)
    {
        return $promotion;
    }

    public function update(Request $request, Promotion $promotion)
    {
        $validatedData = $request->validate([
            'name' => 'string|max:255',
            'discount_type' => 'in:percentage,fixed',
            'discount_value' => 'numeric|min:0',
            'applies_to' => 'in:all_products,specific_product,specific_category',
            'product_id' => 'nullable|exists:products,id',
            'category_id' => 'nullable|exists:categories,id',
            'start_date' => 'date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
            'branch_id' => 'nullable|exists:branches,id',
        ]);

        $validatedData['updated_by'] = $request->user()->id;

        $promotion->update($validatedData);

        return response()->json($promotion);
    }

    public function destroy(Promotion $promotion)
    {
        $promotion->delete();

        return response()->json(null, 204);
    }
}
