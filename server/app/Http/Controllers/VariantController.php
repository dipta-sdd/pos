<?php

namespace App\Http\Controllers;

use App\Models\Variant;
use Illuminate\Http\Request;

class VariantController extends Controller
{
    public function index()
    {
        return Variant::paginate();
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'product_id' => 'required|exists:products,id',
            'name' => 'required|string|max:255',
            'value' => 'required|string|max:255',
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
