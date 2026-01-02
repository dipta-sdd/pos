<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Category;
use App\Models\Vendor;
use App\Models\User;

class CategoryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'vendor_id' => Vendor::factory(),
            'name' => $this->faker->word,
            'description' => $this->faker->sentence,
            'parent_id' => null,
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
        ];
    }
}
