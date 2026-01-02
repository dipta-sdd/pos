<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Product;
use App\Models\Vendor;
use App\Models\Category;
use App\Models\UnitOfMeasure;
use App\Models\User;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'vendor_id' => Vendor::factory(),
            'name' => $this->faker->word,
            'description' => $this->faker->sentence,
            'category_id' => Category::factory(),
            'image_url' => $this->faker->imageUrl,
            'unit_of_measure_id' => UnitOfMeasure::factory(),
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
        ];
    }
}
