<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name', 'description', 'sub_category_id', 'vendor_id', 'created_by', 'updated_by',
    ];
    public function subCategory() { return $this->belongsTo(SubCategory::class); }
    public function vendor() { return $this->belongsTo(Vendor::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
    public function updater() { return $this->belongsTo(User::class, 'updated_by'); }
    public function variants() { return $this->hasMany(ProductVariant::class); }
}
