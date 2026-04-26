<?php

namespace App\Http\Controllers;

use App\Models\CashRegisterSession;
use Illuminate\Http\Request;

class CashRegisterSessionController extends Controller
{
    public function index(Request $request)
    {
        $query = CashRegisterSession::with(['billingCounter.branch', 'user'])
            ->withCount('sales')
            ->withSum('salePayments', 'amount');

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

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('firstName', 'like', "%{$search}%")
                           ->orWhere('lastName', 'like', "%{$search}%");
                    });
            });
        }

        // Sorting
        $sortable = ['id', 'started_at', 'ended_at', 'status', 'opening_balance', 'closing_balance'];
        $sortBy = in_array($request->input('sort_by'), $sortable) ? $request->input('sort_by') : 'started_at';
        $sortDir = $request->input('sort_direction', 'desc') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortDir);

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

    public function posActiveSession(Request $request)
    {
        $session = CashRegisterSession::with(['billingCounter', 'user'])
            ->where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->first();

        if (!$session) {
            return response()->json(['message' => 'No active session found.'], 404);
        }

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
        $cashRegisterSession->load(['billingCounter', 'user', 'salePayments.sale', 'cashTransactions']);
        
        // Append calculated totals for the UI
        $cashRegisterSession->total_sales_cash = $cashRegisterSession->salePayments()->sum('amount');
        $cashRegisterSession->total_cash_in = $cashRegisterSession->cashTransactions()->whereIn('type', ['cash_in', 'transfer_in_from_branch'])->sum('amount');
        $cashRegisterSession->total_cash_out = $cashRegisterSession->cashTransactions()->whereIn('type', ['cash_out', 'transfer_out_to_branch', 'refund'])->sum('amount');
        
        return $cashRegisterSession;
    }

    public function destroy(CashRegisterSession $cashRegisterSession)
    {
        $cashRegisterSession->delete();

        return response()->json(null, 204);
    }
}
