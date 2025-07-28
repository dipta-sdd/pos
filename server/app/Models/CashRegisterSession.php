<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CashRegisterSession extends Model
{
    protected $fillable = [
        'billing_counter_id',
        'user_id',
        'opening_balance',
        'closing_balance',
        'started_at',
        'ended_at',
        'status',
    ];

    public function billingCounter() { return $this->belongsTo(BillingCounter::class); }
    public function user() { return $this->belongsTo(User::class); }
    public function cashTransactions() { return $this->hasMany(CashTransaction::class, 'session_id'); }
}
