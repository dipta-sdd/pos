<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $fillable = [
        'name',
        'vendor_id',
        'created_by',
        'updated_by',
    ];

    public function vendor() { return $this->belongsTo(Vendor::class); }
    public function memberships() { return $this->hasMany(Membership::class); }
    public function permissions() { return $this->belongsToMany(Permission::class, 'role_permission'); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
    public function updater() { return $this->belongsTo(User::class, 'updated_by'); }
}
