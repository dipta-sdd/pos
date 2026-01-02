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
            'website' => $this->faker->url,
            'industry' => $this->faker->bs,
            'contact_person' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'phone' => $this->faker->phoneNumber,
            'address' => $this->faker->address,
            'logo_url' => $this->faker->imageUrl,
            'status' => 'active',
            'subscription_plan' => 'standard',
            'trial_ends_at' => null,
            'timezone' => 'UTC',
        ];
    }
}
