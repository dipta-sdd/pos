<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\UnitOfMeasure;
use App\Models\Vendor;
use App\Models\User;

class UnitOfMeasureFactory extends Factory
{
    public function definition(): array
    {
        return [
            'vendor_id' => Vendor::factory(),
            'name' => $this->faker->word,
            'abbreviation' => $this->faker->lexify('??'),
            'is_decimal_allowed' => $this->faker->boolean,
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
        ];
    }
}
