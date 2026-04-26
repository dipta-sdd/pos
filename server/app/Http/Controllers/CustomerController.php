<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::query();

        if ($request->has('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $perPage = $request->input('per_page', 10);
        return $query->paginate($perPage);
    }

    /**
     * Specialized index for POS searching, limited to essential fields for speed.
     */
    public function posIndex(Request $request)
    {
        $query = Customer::query();

        // Vendor ID is expected from the request interseptor or manually
        if ($request->has('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        return $query->limit(10)->get(['id', 'name', 'phone', 'email', 'address']);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'vendor_id' => 'required|exists:vendors,id',
        ]);

        $validatedData['created_by'] = $request->user()->id;
        $validatedData['updated_by'] = $request->user()->id;

        $customer = Customer::create($validatedData);

        return response()->json($customer, 201);
    }

    public function show(Customer $customer)
    {
        return $customer;
    }

    public function update(Request $request, Customer $customer)
    {
        $validatedData = $request->validate([
            'name' => 'string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string',
        ]);

        $validatedData['updated_by'] = $request->user()->id;

        $customer->update($validatedData);

        return response()->json($customer);
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();

        return response()->json(null, 204);
    }

    public function export(Request $request)
    {
        $query = Customer::query();
        
        if ($request->has('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }

        $customers = $query->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="customers_export_' . now()->format('Y-m-d') . '.csv"',
        ];

        $callback = function() use ($customers) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Name', 'Email', 'Phone', 'Address', 'Join Date']);

            foreach ($customers as $customer) {
                fputcsv($file, [
                    $customer->id,
                    $customer->name,
                    $customer->email,
                    $customer->phone,
                    $customer->address,
                    $customer->created_at->format('Y-m-d'),
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function import(Request $request)
    {
        $request->validate([
            'customers' => 'required|array',
            'customers.*.name' => 'required|string',
            'customers.*.phone' => 'nullable|string',
            'customers.*.email' => 'nullable|email',
        ]);

        $vendorId = $request->vendor_id;
        $count = 0;

        foreach ($request->customers as $data) {
            \App\Models\Customer::updateOrCreate(
                ['vendor_id' => $vendorId, 'phone' => $data['phone']],
                [
                    'name' => $data['name'],
                    'email' => $data['email'] ?? null,
                    'address' => $data['address'] ?? null,
                ]
            );
            $count++;
        }

        return response()->json(['message' => "Successfully imported {$count} customers"]);
    }
}
