<?php

namespace App\Http\Controllers;

use App\Models\CustomerStoreCredit;
use Illuminate\Http\Request;

class CustomerStoreCreditController extends Controller
{
    public function index(Request $request)
    {
        $query = CustomerStoreCredit::with('customer');

        if ($request->has('vendor_id')) {
            $query->whereHas('customer', function ($q) use ($request) {
                $q->where('vendor_id', $request->vendor_id);
            });
        }

        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('customer', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $perPage = $request->input('per_page', 15);
        return $query->paginate($perPage);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'customer_id' => 'required|exists:customers,id|unique:customer_store_credits,customer_id',
            'current_balance' => 'required|numeric|min:0',
        ]);

        $validatedData['created_by'] = $request->user()->id;
        $validatedData['updated_by'] = $request->user()->id;

        $customerStoreCredit = CustomerStoreCredit::create($validatedData);

        return response()->json($customerStoreCredit, 201);
    }

    public function show(CustomerStoreCredit $customerStoreCredit)
    {
        return $customerStoreCredit->load('customer');
    }

    public function update(Request $request, CustomerStoreCredit $customerStoreCredit)
    {
        $validatedData = $request->validate([
            'current_balance' => 'numeric|min:0',
        ]);

        $validatedData['updated_by'] = $request->user()->id;

        $customerStoreCredit->update($validatedData);

        return response()->json($customerStoreCredit);
    }

    public function destroy(CustomerStoreCredit $customerStoreCredit)
    {
        $customerStoreCredit->delete();

        return response()->json(null, 204);
    }
}
