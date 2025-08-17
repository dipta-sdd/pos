<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'firstName',
        'lastName',
        'email',
        'mobile',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }

    // Relationships
    public function memberships(): HasMany
    {
        return $this->hasMany(Membership::class);
    }

    public function ownedVendors(): HasMany
    {
        return $this->hasMany(Vendor::class, 'owner_id');
    }

    public function createdRoles(): HasMany
    {
        return $this->hasMany(Role::class, 'created_by');
    }

    public function updatedRoles(): HasMany
    {
        return $this->hasMany(Role::class, 'updated_by');
    }

    public function createdBranches(): HasMany
    {
        return $this->hasMany(Branch::class, 'created_by');
    }

    public function updatedBranches(): HasMany
    {
        return $this->hasMany(Branch::class, 'updated_by');
    }

    public function createdProducts(): HasMany
    {
        return $this->hasMany(Product::class, 'created_by');
    }

    public function updatedProducts(): HasMany
    {
        return $this->hasMany(Product::class, 'updated_by');
    }

    public function createdSales(): HasMany
    {
        return $this->hasMany(Sale::class, 'created_by');
    }

    public function updatedSales(): HasMany
    {
        return $this->hasMany(Sale::class, 'updated_by');
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class, 'user_id');
    }

    public function returns(): HasMany
    {
        return $this->hasMany(SaleReturn::class, 'user_id');
    }

    public function cashTransactions(): HasMany
    {
        return $this->hasMany(CashTransaction::class, 'created_by');
    }

    public function cashRegisterSessions(): HasMany
    {
        return $this->hasMany(CashRegisterSession::class, 'user_id');
    }

    /**
     * Get the user's full name.
     *
     * @return string
     */
    public function getFullNameAttribute(): string
    {
        return trim($this->firstName . ' ' . $this->lastName);
    }

    // public function vendor(): object|null
    // {
    //     $vendor = Vendor::where('owner_id', $this->id)->first();
    //     if($vendor){
    //         $vendor['role'] = 'owner';
    //         return $vendor;
    //     } else {
    //         $membership = Membership::where('user_id', $this->id)->first();
    //         if($membership){
    //             $vendor = Vendor::where('id', $membership->vendor_id)->first();
    //             $vendor['role'] = $membership->role;
    //             return $vendor;
    //         } else {
    //             return  null;
    //         }
    //     }
    // }
}
