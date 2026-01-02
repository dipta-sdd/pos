<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Tax;
use App\Models\Vendor;
use App\Models\User;

class TaxFactory extends Factory
{
    public function definition(): array
    {
        return [
            'vendor_id' => Vendor::factory(),
            'name' => 'VAT',
            'rate_percentage' => $this->faker->randomFloat(2, 5, 20),
            'is_default' => $this->faker->boolean,
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
        ];
    }
}
