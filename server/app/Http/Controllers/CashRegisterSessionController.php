<?php

namespace App\Http\Controllers;

use App\Models\CashRegisterSession;
use Illuminate\Http\Request;

class CashRegisterSessionController extends Controller
{
    public function index()
    {
        return CashRegisterSession::paginate();
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'billing_counter_id' => 'required|exists:billing_counters,id',
            'user_id' => 'required|exists:users,id',
            'opening_balance' => 'required|numeric|min:0',
            'closing_balance' => 'nullable|numeric|min:0',
            'calculated_cash' => 'nullable|numeric|min:0',
            'discrepancy' => 'nullable|numeric',
            'started_at' => 'required|date',
            'ended_at' => 'nullable|date|after_or_equal:started_at',
            'status' => 'required|in:open,closed',
        ]);

        $validatedData['created_by'] = $request->user()->id;
        $validatedData['updated_by'] = $request->user()->id;

        $cashRegisterSession = CashRegisterSession::create($validatedData);

        return response()->json($cashRegisterSession, 201);
    }

    public function show(CashRegisterSession $cashRegisterSession)
    {
        return $cashRegisterSession;
    }

    public function update(Request $request, CashRegisterSession $cashRegisterSession)
    {
        $validatedData = $request->validate([
            'opening_balance' => 'numeric|min:0',
            'closing_balance' => 'nullable|numeric|min:0',
            'calculated_cash' => 'nullable|numeric|min:0',
            'discrepancy' => 'nullable|numeric',
            'started_at' => 'date',
            'ended_at' => 'nullable|date|after_or_equal:started_at',
            'status' => 'in:open,closed',
        ]);

        $validatedData['updated_by'] = $request->user()->id;

        $cashRegisterSession->update($validatedData);

        return response()->json($cashRegisterSession);
    }

    public function destroy(CashRegisterSession $cashRegisterSession)
    {
        $cashRegisterSession->delete();

        return response()->json(null, 204);
    }
}
