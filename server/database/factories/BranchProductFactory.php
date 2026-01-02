<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\BranchProduct;
use App\Models\Branch;
use App\Models\Product;
use App\Models\Variant;
use App\Models\User;

class BranchProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'branch_id' => Branch::factory(),
            'product_id' => Product::factory(),
            'variant_id' => Variant::factory(),
            'low_stock_threshold' => $this->faker->numberBetween(5, 20),
            'is_active' => true,
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
        ];
    }
}
