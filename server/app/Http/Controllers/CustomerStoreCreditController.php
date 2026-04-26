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

    public function adjustBalance(Request $request)
    {
        $validatedData = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|in:credit,debit',
            'reason' => 'nullable|string',
            'referenceable_id' => 'nullable|integer',
            'referenceable_type' => 'nullable|string',
        ]);

        $user = $request->user();

        $storeCredit = DB::transaction(function () use ($validatedData, $user) {
            $credit = CustomerStoreCredit::firstOrCreate(
                ['customer_id' => $validatedData['customer_id']],
                [
                    'vendor_id' => $user->vendor_id, // Assuming user is scoped or vendor_id is in request
                    'current_balance' => 0,
                    'created_by' => $user->id,
                    'updated_by' => $user->id,
                ]
            );

            if ($validatedData['type'] === 'credit') {
                $credit->increment('current_balance', $validatedData['amount']);
            } else {
                $credit->decrement('current_balance', $validatedData['amount']);
            }

            $credit->transactions()->create([
                'amount' => $validatedData['amount'],
                'type' => $validatedData['type'],
                'referenceable_id' => $validatedData['referenceable_id'],
                'referenceable_type' => $validatedData['referenceable_type'],
                'created_by' => $user->id,
            ]);

            return $credit;
        });

        return response()->json($storeCredit->load('transactions'));
    }

    public function destroy(CustomerStoreCredit $customerStoreCredit)
    {
        $customerStoreCredit->delete();

        return response()->json(null, 204);
    }
}
