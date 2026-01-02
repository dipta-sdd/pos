<?php

namespace App\Http\Controllers;

use App\Models\UnitOfMeasure;
use Illuminate\Http\Request;

class UnitOfMeasureController extends Controller
{
    public function index()
    {
        return UnitOfMeasure::paginate();
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'short_code' => 'required|string|max:255',
            'vendor_id' => 'required|exists:vendors,id',
        ]);

        $validatedData['created_by'] = $request->user()->id;
        $validatedData['updated_by'] = $request->user()->id;

        $unitOfMeasure = UnitOfMeasure::create($validatedData);

        return response()->json($unitOfMeasure, 201);
    }

    public function show(UnitOfMeasure $unitOfMeasure)
    {
        return $unitOfMeasure;
    }

    public function update(Request $request, UnitOfMeasure $unitOfMeasure)
    {
        $validatedData = $request->validate([
            'name' => 'string|max:255',
            'short_code' => 'string|max:255',
        ]);

        $validatedData['updated_by'] = $request->user()->id;

        $unitOfMeasure->update($validatedData);

        return response()->json($unitOfMeasure);
    }

    public function destroy(UnitOfMeasure $unitOfMeasure)
    {
        $unitOfMeasure->delete();

        return response()->json(null, 204);
    }
}
