<?php

namespace App\Http\Controllers;

use App\Models\UnitOfMeasure;
use Illuminate\Http\Request;

class UnitOfMeasureController extends Controller
{
    public function index(Request $request)
    {
        $query = UnitOfMeasure::query();

        $query->where(function ($q) use ($request) {
            $q->where('vendor_id', $request->vendor_id)
                ->orWhereNull('vendor_id');
        });

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('abbreviation', 'like', "%{$search}%");
            });
        }

        $perPage = $request->input('per_page', 15);
        return $query->paginate($perPage);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'abbreviation' => 'required|string|max:255',
            'is_decimal_allowed' => 'boolean',
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
            'abbreviation' => 'string|max:255',
            'is_decimal_allowed' => 'boolean',
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
