<?php

namespace App\Http\Controllers;

use App\Models\ReceiptSettings;
use Illuminate\Http\Request;

class ReceiptSettingsController extends Controller
{
    public function index()
    {
        return ReceiptSettings::paginate();
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'vendor_id' => 'required|exists:vendors,id|unique:receipt_settings,vendor_id',
            'header_text' => 'nullable|string',
            'footer_text' => 'nullable|string',
            'show_logo' => 'boolean',
            'show_address' => 'boolean',
            'show_contact_info' => 'boolean',
            'template_style' => 'string|max:255',
        ]);

        $validatedData['created_by'] = $request->user()->id;
        $validatedData['updated_by'] = $request->user()->id;

        $receiptSettings = ReceiptSettings::create($validatedData);

        return response()->json($receiptSettings, 201);
    }

    public function show($vendor_id)
    {
        return ReceiptSettings::findOrFail($vendor_id);
    }

    public function update(Request $request, $vendor_id)
    {
        $receiptSettings = ReceiptSettings::findOrFail($vendor_id);

        $validatedData = $request->validate([
            'header_text' => 'nullable|string',
            'footer_text' => 'nullable|string',
            'show_logo' => 'boolean',
            'show_address' => 'boolean',
            'show_contact_info' => 'boolean',
            'template_style' => 'string|max:255',
        ]);

        $validatedData['updated_by'] = $request->user()->id;

        $receiptSettings->update($validatedData);

        return response()->json($receiptSettings);
    }

    public function destroy($vendor_id)
    {
        $receiptSettings = ReceiptSettings::findOrFail($vendor_id);
        $receiptSettings->delete();

        return response()->json(null, 204);
    }
}
