<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Membership;
use App\Models\User;
use App\Models\Vendor;
use App\Models\Role;

class MembershipFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'vendor_id' => Vendor::factory(),
            'role_id' => Role::factory(),
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
        ];
    }
}
