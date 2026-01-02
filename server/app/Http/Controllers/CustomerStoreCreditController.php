<?php

namespace App\Http\Controllers;

use App\Models\CustomerStoreCredit;
use Illuminate\Http\Request;

class CustomerStoreCreditController extends Controller
{
    public function index()
    {
        return CustomerStoreCredit::paginate();
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
        return $customerStoreCredit;
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
