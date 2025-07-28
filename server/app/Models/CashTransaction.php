<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CashTransaction extends Model
{
    protected $fillable = [
        'session_id',
        'amount',
        'type',
        'notes',
        'created_by',
        'created_at',
    ];

    public function session() { return $this->belongsTo(CashRegisterSession::class, 'session_id'); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
}
