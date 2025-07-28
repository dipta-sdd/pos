<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    protected $fillable = [
        'product_id', 'name', 'price', 'sku', 'barcode', 'discount_percentage', 'created_by', 'updated_by',
    ];
    public function product() { return $this->belongsTo(Product::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
    public function updater() { return $this->belongsTo(User::class, 'updated_by'); }
    public function inventoryItems() { return $this->hasMany(InventoryItem::class); }
    public function purchaseOrderItems() { return $this->hasMany(PurchaseOrderItem::class); }
    public function saleItems() { return $this->hasMany(SaleItem::class); }
}
