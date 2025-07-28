<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    protected $fillable = [
        'name',
        'contact_person',
        'email',
        'phone',
        'address',
        'vendor_id',
        'created_by',
        'updated_by',
    ];

    public function vendor() { return $this->belongsTo(Vendor::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
    public function updater() { return $this->belongsTo(User::class, 'updated_by'); }
    public function purchaseOrders() { return $this->hasMany(PurchaseOrder::class); }
}
