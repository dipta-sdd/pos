<?php

namespace App\Models;

use App\Traits\LogsActivity;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReceiptSettings extends Model
{
    use LogsActivity;
    use HasFactory;

    protected $primaryKey = 'vendor_id';
    public $incrementing = false;

    protected $fillable = [
        'vendor_id',
        'header_text',
        'footer_text',
        'show_logo',
        'show_address',
        'show_contact_info',
        'template_style',
        'font_size',
        'show_tax_breakdown',
        'show_payment_details',
        'show_barcode',
        'show_salesperson',
        'show_sale_id',
        'show_date_time',
        'show_item_qty',
        'show_item_price',
        'show_item_unit',
        'show_item_discount',
        'show_item_tax',
        'show_item_total',
        'label_item',
        'label_qty',
        'label_price',
        'label_unit',
        'label_total',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'show_logo' => 'boolean',
        'show_address' => 'boolean',
        'show_contact_info' => 'boolean',
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
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
} 