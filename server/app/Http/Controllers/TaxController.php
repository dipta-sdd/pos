<?php

namespace App\Http\Controllers;

use App\Models\Tax;
use Illuminate\Http\Request;

class TaxController extends Controller
{
    public function index()
    {
        return Tax::paginate();
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'rate_percentage' => 'required|numeric|min:0|max:100',
            'is_default' => 'boolean',
            'vendor_id' => 'required|exists:vendors,id',
        ]);

        $validatedData['created_by'] = $request->user()->id;
        $validatedData['updated_by'] = $request->user()->id;

        $tax = Tax::create($validatedData);

        return response()->json($tax, 201);
    }

    public function show(Tax $tax)
    {
        return $tax;
    }

    public function update(Request $request, Tax $tax)
    {
        $validatedData = $request->validate([
            'name' => 'string|max:255',
            'rate_percentage' => 'numeric|min:0|max:100',
            'is_default' => 'boolean',
        ]);

        $validatedData['updated_by'] = $request->user()->id;

        $tax->update($validatedData);

        return response()->json($tax);
    }

    public function destroy(Tax $tax)
    {
        $tax->delete();

        return response()->json(null, 204);
    }
}
