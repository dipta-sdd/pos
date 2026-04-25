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
            'font_size' => 'in:small,medium,large',
            'show_tax_breakdown' => 'boolean',
            'show_payment_details' => 'boolean',
            'show_barcode' => 'boolean',
            'show_salesperson' => 'boolean',
            'show_sale_id' => 'boolean',
            'show_date_time' => 'boolean',
            'show_item_qty' => 'boolean',
            'show_item_price' => 'boolean',
            'show_item_unit' => 'boolean',
            'show_item_discount' => 'boolean',
            'show_item_tax' => 'boolean',
            'show_item_total' => 'boolean',
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
            'font_size' => 'in:small,medium,large',
            'show_tax_breakdown' => 'boolean',
            'show_payment_details' => 'boolean',
            'show_barcode' => 'boolean',
            'show_salesperson' => 'boolean',
            'show_sale_id' => 'boolean',
            'show_date_time' => 'boolean',
            'show_item_qty' => 'boolean',
            'show_item_price' => 'boolean',
            'show_item_unit' => 'boolean',
            'show_item_discount' => 'boolean',
            'show_item_tax' => 'boolean',
            'show_item_total' => 'boolean',
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
