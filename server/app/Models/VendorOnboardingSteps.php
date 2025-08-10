<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorOnboardingSteps extends Model
{
    use HasFactory;

    protected $primaryKey = 'vendor_id';
    public $incrementing = false;

    protected $fillable = [
        'vendor_id',
        'has_created_branch',
        'has_created_product',
        'has_invited_staff',
        'has_completed_wizard',
    ];

    protected $casts = [
        'has_created_branch' => 'boolean',
        'has_created_product' => 'boolean',
        'has_invited_staff' => 'boolean',
        'has_completed_wizard' => 'boolean',
    ];

    // Relationships
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }
} 