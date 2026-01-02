<?php

namespace App\Http\Controllers;

use App\Models\Membership;
use Illuminate\Http\Request;

class MembershipController extends Controller
{
    public function index()
    {
        return Membership::paginate();
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'user_id' => 'required|exists:users,id',
            'vendor_id' => 'required|exists:vendors,id',
            'role_id' => 'required|exists:roles,id',
        ]);

        $validatedData['created_by'] = $request->user()->id;
        $validatedData['updated_by'] = $request->user()->id;

        $membership = Membership::create($validatedData);

        return response()->json($membership, 201);
    }

    public function show(Membership $membership)
    {
        return $membership;
    }

    public function update(Request $request, Membership $membership)
    {
        $validatedData = $request->validate([
            'role_id' => 'exists:roles,id',
        ]);

        $validatedData['updated_by'] = $request->user()->id;

        $membership->update($validatedData);

        return response()->json($membership);
    }

    public function destroy(Membership $membership)
    {
        $membership->delete();

        return response()->json(null, 204);
    }
}
