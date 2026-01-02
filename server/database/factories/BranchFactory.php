<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Branch;
use App\Models\Vendor;

class BranchFactory extends Factory
{
    public function definition(): array
    {
        return [
            'vendor_id' => Vendor::factory(),
            'name' => $this->faker->company . ' Branch',
            'description' => $this->faker->paragraph,
            'phone' => $this->faker->phoneNumber,
            'address' => $this->faker->address,
            'created_by' => \App\Models\User::factory(),
            'updated_by' => \App\Models\User::factory(),
        ];
    }
}
