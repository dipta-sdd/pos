<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class CustomerStoreCreditTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_credit_id',
        'amount',
        'type',
        'referenceable_id',
        'referenceable_type',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function storeCredit(): BelongsTo
    {
        return $this->belongsTo(CustomerStoreCredit::class, 'store_credit_id');
    }

    public function referenceable(): MorphTo
    {
        return $this->morphTo();
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
} 