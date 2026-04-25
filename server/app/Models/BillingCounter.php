<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

use Illuminate\Database\Eloquent\Relations\HasOne;

class BillingCounter extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_id',
        'name',
        'created_by',
        'updated_by',
    ];

    protected $appends = [
        'created_by_name',
        'updated_by_name',
    ];

    public function getCreatedByNameAttribute()
    {
        return $this->createdBy?->name;
    }

    public function getUpdatedByNameAttribute()
    {
        return $this->updatedBy?->name;
    }

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function paymentMethod(): HasOne
    {
        return $this->hasOne(PaymentMethod::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function cashRegisterSessions(): HasMany
    {
        return $this->hasMany(CashRegisterSession::class);
    }

    public function activeSession(): HasOne
    {
        return $this->hasOne(CashRegisterSession::class)->where('status', 'open');
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
} 