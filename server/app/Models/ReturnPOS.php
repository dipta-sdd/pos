<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReturnPOS extends Model
{
    public $table = 'returns';
    public $timestamps = false;
    protected $fillable = [
        'original_sale_id', 'reason', 'refund_amount', 'user_id', 'branch_id', 'created_at',
    ];
    public function originalSale() { return $this->belongsTo(Sale::class, 'original_sale_id'); }
    public function user() { return $this->belongsTo(User::class); }
    public function branch() { return $this->belongsTo(Branch::class); }
    public function returnItems() { return $this->hasMany(ReturnItem::class, 'return_instance_id'); }
}
