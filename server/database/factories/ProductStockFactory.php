<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\ProductStock;
use App\Models\Branch;
use App\Models\Product;
use App\Models\Variant;

class ProductStockFactory extends Factory
{
    public function definition(): array
    {
        return [
            'branch_id' => Branch::factory(),
            'product_id' => Product::factory(),
            'variant_id' => Variant::factory(),
            'quantity' => $this->faker->randomFloat(2, 0, 1000),
            'cost_price' => $this->faker->randomFloat(2, 10, 500),
            'selling_price' => $this->faker->randomFloat(2, 20, 1000),
        ];
    }
}
