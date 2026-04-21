<?php

namespace App\Http\Controllers;

use App\Models\CashTransaction;
use App\Models\CashRegisterSession;
use Illuminate\Http\Request;

class CashTransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = CashTransaction::with(['cashRegisterSession', 'createdBy', 'cashRegisterSession.billingCounter']);

        if ($request->has('vendor_id')) {
            $query->whereHas('cashRegisterSession.billingCounter', function ($q) use ($request) {
                $q->where('vendor_id', $request->vendor_id);
            });
        }

        if ($request->has('cash_register_session_id')) {
            $query->where('cash_register_session_id', $request->cash_register_session_id);
        }

        $perPage = $request->input('per_page', 10);
        return $query->paginate($perPage);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|in:cash_in,cash_out,transfer_out_to_branch,transfer_in_from_branch',
            'notes' => 'nullable|string',
            'payment_method_id' => 'required|exists:payment_methods,id',
        ]);

        // Find active session for the user
        $activeSession = CashRegisterSession::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->first();

        if (!$activeSession) {
            return response()->json(['message' => 'You must have an open cash register session to perform this transaction.'], 422);
        }

        $transaction = CashTransaction::create([
            'cash_register_session_id' => $activeSession->id,
            'payment_method_id' => $validatedData['payment_method_id'],
            'amount' => $validatedData['amount'],
            'type' => $validatedData['type'],
            'notes' => $validatedData['notes'],
            'created_by' => $request->user()->id,
        ]);

        return response()->json($transaction, 201);
    }

    public function show(CashTransaction $cashTransaction)
    {
        return $cashTransaction->load(['cashRegisterSession', 'createdBy']);
    }
}
