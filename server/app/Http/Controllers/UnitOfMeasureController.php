<?php

namespace App\Http\Controllers;

use App\Models\UnitOfMeasure;
use Illuminate\Http\Request;

class UnitOfMeasureController extends Controller
{
    public function index(Request $request)
    {
        $query = UnitOfMeasure::query();

        if ($request->has('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('short_code', 'like', "%{$search}%");
            });
        }

        $perPage = $request->input('per_page', 15);
        return $query->paginate($perPage);
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
