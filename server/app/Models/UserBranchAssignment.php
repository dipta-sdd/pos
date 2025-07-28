<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserBranchAssignment extends Model
{
    protected $fillable = [
        'membership_id',
        'branch_id',
        'created_by',
        'updated_by',
    ];

    public function membership() { return $this->belongsTo(Membership::class); }
    public function branch() { return $this->belongsTo(Branch::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
    public function updater() { return $this->belongsTo(User::class, 'updated_by'); }
}
