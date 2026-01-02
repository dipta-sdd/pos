<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\SaleReturn;
use App\Models\Vendor;
use App\Models\Branch;
use App\Models\Sale;
use App\Models\User;

class SaleReturnFactory extends Factory
{
    public function definition(): array
    {
        return [
            'vendor_id' => Vendor::factory(),
            'branch_id' => Branch::factory(),
            'original_sale_id' => Sale::factory(),
            'user_id' => User::factory(),
            'reason' => $this->faker->sentence,
            'refund_type' => $this->faker->randomElement(['cash', 'store_credit']),
            'refund_amount' => $this->faker->randomFloat(2, 10, 100),
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
        ];
    }
}
