<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\StockTransfer;
use App\Models\Vendor;
use App\Models\Branch;
use App\Models\User;

class StockTransferFactory extends Factory
{
    public function definition(): array
    {
        return [
            'vendor_id' => Vendor::factory(),
            'from_branch_id' => Branch::factory(),
            'to_branch_id' => Branch::factory(),
            'status' => $this->faker->randomElement(['pending', 'shipped', 'received', 'cancelled']),
            'notes' => $this->faker->sentence,
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
        ];
    }
}
