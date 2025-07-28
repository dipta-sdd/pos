<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    public $timestamps = false;
    protected $fillable = [
        'final_amount', 'status', 'vendor_id', 'branch_id', 'user_id', 'billing_counter_id', 'created_at',
    ];
    public function vendor() { return $this->belongsTo(Vendor::class); }
    public function branch() { return $this->belongsTo(Branch::class); }
    public function user() { return $this->belongsTo(User::class); }
    public function billingCounter() { return $this->belongsTo(BillingCounter::class); }
    public function saleItems() { return $this->hasMany(SaleItem::class); }
    public function salePayments() { return $this->hasMany(SalePayment::class); }
    public function returns() { return $this->hasMany(ReturnPOS::class, 'original_sale_id'); }
}
