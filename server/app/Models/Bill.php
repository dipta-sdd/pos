<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bill extends Model
{
    public $timestamps = false;
    protected $fillable = [
        'vendor_id', 'transaction_type', 'reference_id', 'amount', 'description', 'created_at',
    ];
    public function vendor() { return $this->belongsTo(Vendor::class); }
}
