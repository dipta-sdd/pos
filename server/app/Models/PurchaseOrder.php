<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    protected $fillable = [
        'supplier_id',
        'branch_id',
        'status',
        'total_amount',
        'order_date',
        'expected_delivery_date',
        'vendor_id',
        'created_by',
        'updated_by',
    ];

    public function supplier() { return $this->belongsTo(Supplier::class); }
    public function branch() { return $this->belongsTo(Branch::class); }
    public function vendor() { return $this->belongsTo(Vendor::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
    public function updater() { return $this->belongsTo(User::class, 'updated_by'); }
    public function items() { return $this->hasMany(PurchaseOrderItem::class); }
}
