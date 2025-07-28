<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    protected $fillable = [
        'name', 'vendor_id', 'branch_id', 'is_active', 'created_by', 'updated_by',
    ];
    public function vendor() { return $this->belongsTo(Vendor::class); }
    public function branch() { return $this->belongsTo(Branch::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
    public function updater() { return $this->belongsTo(User::class, 'updated_by'); }
    public function salePayments() { return $this->hasMany(SalePayment::class); }
}
