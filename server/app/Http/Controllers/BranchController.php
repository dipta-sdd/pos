<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    public function index(Request $request)
    {
        $query = Branch::query();

        if ($request->has('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');

        // Whitelist sortable columns
        $allowedSortColumns = ['name', 'address', 'phone', 'created_at'];
        if (in_array($sortBy, $allowedSortColumns)) {
            $query->orderBy($sortBy, $sortDirection === 'asc' ? 'asc' : 'desc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = $request->input('per_page', 15);
        return $query->paginate($perPage);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'vendor_id' => 'required|exists:vendors,id',
        ]);

        $validatedData['created_by'] = $request->user()->id;
        $validatedData['updated_by'] = $request->user()->id;

        $branch = Branch::create($validatedData);

        return response()->json($branch, 201);
    }

    public function show(Branch $branch)
    {
        return $branch;
    }

    public function update(Request $request, Branch $branch)
    {
        $validatedData = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string',
        ]);

        $validatedData['updated_by'] = $request->user()->id;

        $branch->update($validatedData);

        return response()->json($branch);
    }

    public function destroy(Branch $branch)
    {
        // Check if this is the only branch for the vendor
        $count = Branch::where('vendor_id', $branch->vendor_id)->count();

        if ($count <= 1) {
            return response()->json(['message' => 'Cannot delete the only branch. A vendor must have at least one branch.'], 400);
        }

        $branch->delete();

        return response()->json(null, 204);
    }
}
