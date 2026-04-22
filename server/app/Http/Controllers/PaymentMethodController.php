<?php

namespace App\Http\Controllers;

use App\Models\PaymentMethod;
use Illuminate\Http\Request;

class PaymentMethodController extends Controller
{
    public function posIndex(Request $request)
    {
        $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'branch_id' => 'required|exists:branches,id',
            'billing_counter_id' => 'required|exists:billing_counters,id',
        ]);

        $query = PaymentMethod::query()
            ->where('vendor_id', $request->vendor_id)
            ->where('is_active', true);

        // Filter by branch: current branch or global
        $query->where(function ($q) use ($request) {
            $q->where('branch_id', $request->branch_id)
                ->orWhereNull('branch_id');
        });

        // Specific POS Logic:
        // 1. Load everything EXCEPT 'cash' type (we use billing_counter instead)
        // 2. Only load 'billing_counter' type if it matches the current counter
        $query->where(function ($q) use ($request) {
            $q->where(function ($sq) {
                $sq->whereNotIn('type', ['cash', 'billing_counter']);
            })
                ->orWhere(function ($sq) use ($request) {
                    $sq->where('type', 'billing_counter')
                        ->where('billing_counter_id', $request->billing_counter_id);
                });
        });

        return response()->json([
            'data' => $query->get()
        ]);
    }

    public function index(Request $request)
    {
        $query = PaymentMethod::query();

        if ($request->has('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }

        if ($request->has('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->has('billing_counter_id')) {
            $counterId = $request->billing_counter_id;
            $query->where(function ($q) use ($counterId) {
                $q->where('billing_counter_id', $counterId)
                    ->orWhereNull('billing_counter_id');
            });
        } else {
            $query->whereNull('billing_counter_id');
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $perPage = $request->input('per_page', 10);
        return $query->paginate($perPage);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'is_active' => 'boolean',
            'vendor_id' => 'required|exists:vendors,id',
            'branch_id' => 'nullable|exists:branches,id',
        ]);

        $validatedData['created_by'] = $request->user()->id;
        $validatedData['updated_by'] = $request->user()->id;

        $paymentMethod = PaymentMethod::create($validatedData);

        return response()->json($paymentMethod, 201);
    }

    public function show(PaymentMethod $paymentMethod)
    {
        return $paymentMethod;
    }

    public function update(Request $request, PaymentMethod $paymentMethod)
    {
        $validatedData = $request->validate([
            'name' => 'string|max:255',
            'is_active' => 'boolean',
            'branch_id' => 'nullable|exists:branches,id',
        ]);

        $validatedData['updated_by'] = $request->user()->id;

        $paymentMethod->update($validatedData);

        return response()->json($paymentMethod);
    }

    public function destroy(PaymentMethod $paymentMethod)
    {
        $paymentMethod->delete();

        return response()->json(null, 204);
    }
}
