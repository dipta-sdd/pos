<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BillingCounter extends Model
{
    protected $fillable = [
        'name',
        'branch_id',
        'created_by',
        'updated_by',
    ];

    public function branch() { return $this->belongsTo(Branch::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
    public function updater() { return $this->belongsTo(User::class, 'updated_by'); }
    public function cashRegisterSessions() { return $this->hasMany(CashRegisterSession::class); }
    public function sales() { return $this->hasMany(Sale::class); }
}
