<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalePayment extends Model
{
    public $timestamps = false;
    protected $fillable = [
        'sale_id', 'payment_method_id', 'amount',
    ];
    public function sale() { return $this->belongsTo(Sale::class); }
    public function paymentMethod() { return $this->belongsTo(PaymentMethod::class); }
}
