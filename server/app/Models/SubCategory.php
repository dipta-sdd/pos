<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubCategory extends Model
{
    protected $fillable = [
        'name', 'category_id', 'vendor_id', 'created_by', 'updated_by',
    ];
    public function category() { return $this->belongsTo(Category::class); }
    public function vendor() { return $this->belongsTo(Vendor::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
    public function updater() { return $this->belongsTo(User::class, 'updated_by'); }
    public function products() { return $this->hasMany(Product::class); }
}
