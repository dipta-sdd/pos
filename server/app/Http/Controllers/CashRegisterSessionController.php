<?php

namespace App\Http\Controllers;

use App\Models\CashRegisterSession;
use Illuminate\Http\Request;

class CashRegisterSessionController extends Controller
{
    public function index(Request $request)
    {
        $query = CashRegisterSession::with(['billingCounter', 'user', 'billingCounter.branch']);

        if ($request->has('vendor_id')) {
            $query->whereHas('billingCounter.branch', function ($q) use ($request) {
                $q->where('vendor_id', $request->vendor_id);
            });
        }

        if ($request->has('branch_ids')) {
            $branchIds = $request->branch_ids;
            $query->whereHas('billingCounter', function ($q) use ($branchIds) {
                $q->whereIn('branch_id', $branchIds);
            });
        }

        $perPage = $request->input('per_page', 10);
        return $query->paginate($perPage);
    }

    public function activeSession(Request $request)
    {
        $session = CashRegisterSession::with(['billingCounter', 'user'])
            ->where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->first();

        return response()->json($session);
    }

    public function openSession(Request $request)
    {
        $validatedData = $request->validate([
            'billing_counter_id' => 'required|exists:billing_counters,id',
            'opening_balance' => 'required|numeric|min:0',
        ]);

        // Check if user already has an open session
        $existingSession = CashRegisterSession::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->first();

        if ($existingSession) {
            return response()->json(['message' => 'You already have an open session.'], 422);
        }

        // Check if counter already has an open session
        $counterSession = CashRegisterSession::where('billing_counter_id', $validatedData['billing_counter_id'])
            ->where('status', 'open')
            ->first();

        if ($counterSession) {
            return response()->json(['message' => 'This register is already in use by another user.'], 422);
        }

        $session = CashRegisterSession::create([
            'billing_counter_id' => $validatedData['billing_counter_id'],
            'user_id' => $request->user()->id,
            'opening_balance' => $validatedData['opening_balance'],
            'started_at' => now(),
            'status' => 'open',
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);

        return response()->json($session, 201);
    }

    public function closeSession(Request $request, CashRegisterSession $cashRegisterSession)
    {
        $validatedData = $request->validate([
            'closing_balance' => 'required|numeric|min:0',
        ]);

        if ($cashRegisterSession->status === 'closed') {
            return response()->json(['message' => 'Session is already closed.'], 422);
        }

        // Calculate expected cash
        // expected = opening + total_sale_payments + total_cash_in - total_cash_out
        $salePayments = $cashRegisterSession->salePayments()->sum('amount');
        
        // Sum other cash transactions (cash_in, cash_out, etc.)
        $cashIn = $cashRegisterSession->cashTransactions()->whereIn('type', ['cash_in', 'transfer_in_from_branch'])->sum('amount');
        $cashOut = $cashRegisterSession->cashTransactions()->whereIn('type', ['cash_out', 'transfer_out_to_branch', 'refund'])->sum('amount');

        $calculatedCash = $cashRegisterSession->opening_balance + $salePayments + $cashIn - $cashOut;
        $discrepancy = $validatedData['closing_balance'] - $calculatedCash;

        $cashRegisterSession->update([
            'closing_balance' => $validatedData['closing_balance'],
            'calculated_cash' => $calculatedCash,
            'discrepancy' => $discrepancy,
            'ended_at' => now(),
            'status' => 'closed',
            'updated_by' => $request->user()->id,
        ]);

        return response()->json($cashRegisterSession);
    }

    public function show(CashRegisterSession $cashRegisterSession)
    {
        return $cashRegisterSession->load(['billingCounter', 'user', 'salePayments', 'cashTransactions']);
    }

    public function destroy(CashRegisterSession $cashRegisterSession)
    {
        $cashRegisterSession->delete();

        return response()->json(null, 204);
    }
}
