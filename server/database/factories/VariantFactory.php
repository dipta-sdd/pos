<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Variant;
use App\Models\Product;
use App\Models\User;

class VariantFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'name' => $this->faker->randomElement(['Size', 'Color']),
            'value' => $this->faker->randomElement(['S', 'M', 'L', 'Red', 'Blue', 'Green']),
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
        ];
    }
}
