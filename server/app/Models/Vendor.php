<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vendor extends Model
{
    protected $fillable = [
        'name',
        'owner',
        'subscription_tier',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner');
    }
    public function roles() { return $this->hasMany(Role::class); }
    public function memberships() { return $this->hasMany(Membership::class); }
    public function branches() { return $this->hasMany(Branch::class); }
    public function suppliers() { return $this->hasMany(Supplier::class); }
    public function categories() { return $this->hasMany(Category::class); }
    public function subCategories() { return $this->hasMany(SubCategory::class); }
    public function products() { return $this->hasMany(Product::class); }
    public function customers() { return $this->hasMany(Customer::class); }
    public function paymentMethods() { return $this->hasMany(PaymentMethod::class); }
    public function purchaseOrders() { return $this->hasMany(PurchaseOrder::class); }
    public function bills() { return $this->hasMany(Bill::class); }
}
