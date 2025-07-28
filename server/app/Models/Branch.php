<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    protected $fillable = [
        'name',
        'address',
        'vendor_id',
        'created_by',
        'updated_by',
    ];

    public function vendor() { return $this->belongsTo(Vendor::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
    public function updater() { return $this->belongsTo(User::class, 'updated_by'); }
    public function billingCounters() { return $this->hasMany(BillingCounter::class); }
    public function userBranchAssignments() { return $this->hasMany(UserBranchAssignment::class); }
    public function inventoryItems() { return $this->hasMany(InventoryItem::class); }
    public function paymentMethods() { return $this->hasMany(PaymentMethod::class); }
    public function sales() { return $this->hasMany(Sale::class); }
    public function returns() { return $this->hasMany(ReturnPOS::class); }
}
