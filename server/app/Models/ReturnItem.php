<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReturnItem extends Model
{
    public $timestamps = false;
    protected $fillable = [
        'return_instance_id', 'sale_item_id', 'quantity',
    ];
    public function returnInstance() { return $this->belongsTo(ReturnPOS::class, 'return_instance_id'); }
    public function saleItem() { return $this->belongsTo(SaleItem::class); }
}
