<?php

namespace App\Http\Controllers;

use App\Models\Promotion;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    public function index(Request $request)
    {
        $query = Promotion::query();

        if ($request->has('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }

        if ($request->has('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $perPage = $request->input('per_page', 10);
        return $query->paginate($perPage);
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

    $validatedData = $this->mapPromotionData($validatedData);
        $validatedData['created_by'] = $request->user()->id;
        $validatedData['updated_by'] = $request->user()->id;

        $promotion = Promotion::create($validatedData);

        return response()->json($promotion, 201);
    }

    public function bulkStatus(Request $request)
    {
        $validatedData = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:promotions,id',
            'is_active' => 'required|boolean',
        ]);

        Promotion::whereIn('id', $validatedData['ids'])
            ->update([
                'is_active' => $validatedData['is_active'],
                'updated_by' => $request->user()->id,
                'updated_at' => now(),
            ]);

        return response()->json(['message' => 'Promotions updated successfully']);
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

        if (isset($validatedData['discount_type']) || isset($validatedData['applies_to'])) {
            $validatedData = $this->mapPromotionData($validatedData);
        }

        $validatedData['updated_by'] = $request->user()->id;

        $promotion->update($validatedData);

        return response()->json($promotion);
    }

    private function mapPromotionData(array $data): array
    {
        if (isset($data['discount_type'])) {
            $data['discount_type'] = $data['discount_type'] === 'fixed' ? 'fixed_amount' : 'percentage';
        }

        if (isset($data['applies_to'])) {
            $map = [
                'all_products' => 'entire_vendor',
                'specific_product' => 'product',
                'specific_category' => 'category',
            ];
            $data['applies_to'] = $map[$data['applies_to']] ?? $data['applies_to'];
        }

        return $data;
    }

    public function destroy(Promotion $promotion)
    {
        $promotion->delete();

        return response()->json(null, 204);
    }

    public function calculateDiscounts(Request $request, \App\Services\PromotionService $promotionService)
    {
        $validatedData = $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'branch_id' => 'nullable|exists:branches,id',
            'items' => 'required|array',
            'items.*.variant_id' => 'required|exists:variants,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.price' => 'required|numeric|min:0',
        ]);

        $discounts = $promotionService->calculateDiscounts(
            $validatedData['vendor_id'],
            $validatedData['branch_id'] ?? null,
            $validatedData['items']
        );

        return response()->json($discounts);
    }
}
