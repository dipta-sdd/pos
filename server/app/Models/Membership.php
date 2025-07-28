<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Membership extends Model
{
    protected $fillable = [
        'user_id',
        'vendor_id',
        'role_id',
        'created_by',
        'updated_by',
    ];

    public function user() { return $this->belongsTo(User::class); }
    public function vendor() { return $this->belongsTo(Vendor::class); }
    public function role() { return $this->belongsTo(Role::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
    public function updater() { return $this->belongsTo(User::class, 'updated_by'); }
    public function branchAssignments() { return $this->hasMany(UserBranchAssignment::class); }
}
