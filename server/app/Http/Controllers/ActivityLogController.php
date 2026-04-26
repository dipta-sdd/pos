<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = ActivityLog::with(['user', 'branch'])
            ->where('vendor_id', $request->vendor_id);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('action', 'like', "%{$search}%")
                  ->orWhere('model_type', 'like', "%{$search}%")
                  ->orWhereHas('user', function($uq) use ($search) {
                      $uq->where('firstName', 'like', "%{$search}%")
                         ->orWhere('lastName', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->has('branch_ids')) {
            $query->whereIn('branch_id', (array)$request->branch_ids);
        }

        if ($request->has('action') && $request->action !== 'all') {
            $query->where('action', $request->action);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDir);

        return $query->paginate($request->input('per_page', 15));
    }

    public function show(ActivityLog $activityLog)
    {
        return $activityLog->load(['user', 'branch', 'vendor']);
    }
}
