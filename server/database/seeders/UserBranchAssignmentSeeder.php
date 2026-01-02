<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\UserBranchAssignment;

class UserBranchAssignmentSeeder extends Seeder
{
    public function run(): void
    {
        UserBranchAssignment::factory()->count(10)->create();
    }
}
