<?php

namespace App\Http\Controllers;

use App\Models\UserBranchAssignment;
use Illuminate\Http\Request;

class UserBranchAssignmentController extends Controller
{
    public function index()
    {
        return UserBranchAssignment::paginate();
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'membership_id' => 'required|exists:memberships,id',
            'branch_id' => 'required|exists:branches,id',
        ]);

        $validatedData['created_by'] = $request->user()->id;
        $validatedData['updated_by'] = $request->user()->id;

        $userBranchAssignment = UserBranchAssignment::create($validatedData);

        return response()->json($userBranchAssignment, 201);
    }

    public function show(UserBranchAssignment $userBranchAssignment)
    {
        return $userBranchAssignment;
    }

    public function update(Request $request, UserBranchAssignment $userBranchAssignment)
    {
        $validatedData = $request->validate([
            'membership_id' => 'exists:memberships,id',
            'branch_id' => 'exists:branches,id',
        ]);

        $validatedData['updated_by'] = $request->user()->id;

        $userBranchAssignment->update($validatedData);

        return response()->json($userBranchAssignment);
    }

    public function destroy(UserBranchAssignment $userBranchAssignment)
    {
        $userBranchAssignment->delete();

        return response()->json(null, 204);
    }
}
