<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaleItem extends Model
{
    public $timestamps = false;
    protected $fillable = [
        'sale_id', 'product_variant_id', 'quantity', 'price_at_sale', 'discount_percentage',
    ];
    public function sale() { return $this->belongsTo(Sale::class); }
    public function productVariant() { return $this->belongsTo(ProductVariant::class); }
    public function returnItems() { return $this->hasMany(ReturnItem::class); }
}
