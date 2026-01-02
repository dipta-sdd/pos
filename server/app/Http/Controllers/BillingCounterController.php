<?php

namespace App\Http\Controllers;

use App\Models\BillingCounter;
use Illuminate\Http\Request;

class BillingCounterController extends Controller
{
    public function index()
    {
        return BillingCounter::paginate();
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'branch_id' => 'required|exists:branches,id',
        ]);

        $validatedData['created_by'] = $request->user()->id;
        $validatedData['updated_by'] = $request->user()->id;

        $billingCounter = BillingCounter::create($validatedData);

        return response()->json($billingCounter, 201);
    }

    public function show(BillingCounter $billingCounter)
    {
        return $billingCounter;
    }

    public function update(Request $request, BillingCounter $billingCounter)
    {
        $validatedData = $request->validate([
            'name' => 'string|max:255',
        ]);

        $validatedData['updated_by'] = $request->user()->id;

        $billingCounter->update($validatedData);

        return response()->json($billingCounter);
    }

    public function destroy(BillingCounter $billingCounter)
    {
        $billingCounter->delete();

        return response()->json(null, 204);
    }
}
