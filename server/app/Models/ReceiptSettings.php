<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReceiptSettings extends Model
{
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
    ];

    protected $casts = [
        'show_logo' => 'boolean',
        'show_address' => 'boolean',
        'show_contact_info' => 'boolean',
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