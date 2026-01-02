<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\UserBranchAssignment;
use App\Models\Membership;
use App\Models\Branch;
use App\Models\User;

class UserBranchAssignmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'membership_id' => Membership::factory(),
            'branch_id' => Branch::factory(),
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
        ];
    }
}
