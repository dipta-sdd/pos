<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Vendor;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Vendor>
 */
class VendorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'owner_id' => User::factory(),
            'name' => $this->faker->company,
            'description' => $this->faker->paragraph,
            'phone' => $this->faker->phoneNumber,
            'address' => $this->faker->address,
            'subscription_tier' => 'standard',
            'currency' => 'USD',
            'timezone' => 'UTC',
            'language' => 'en',
        ];
    }
}
