<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CashRegisterSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'billing_counter_id',
        'user_id',
        'opening_balance',
        'closing_balance',
        'calculated_cash',
        'discrepancy',
        'started_at',
        'ended_at',
        'status',
    ];

    protected $casts = [
        'opening_balance' => 'decimal:2',
        'closing_balance' => 'decimal:2',
        'calculated_cash' => 'decimal:2',
        'discrepancy' => 'decimal:2',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    // Relationships
    public function billingCounter(): BelongsTo
    {
        return $this->belongsTo(BillingCounter::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function cashTransactions(): HasMany
    {
        return $this->hasMany(CashTransaction::class);
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }
} 