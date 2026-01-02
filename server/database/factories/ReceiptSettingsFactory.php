<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\ReceiptSettings;
use App\Models\Vendor;
use App\Models\User;

class ReceiptSettingsFactory extends Factory
{
    public function definition(): array
    {
        return [
            'vendor_id' => Vendor::factory(),
            'header_text' => $this->faker->sentence,
            'footer_text' => $this->faker->sentence,
            'show_logo' => $this->faker->boolean,
            'show_address' => $this->faker->boolean,
            'show_contact_info' => $this->faker->boolean,
            'template_style' => 'default',
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
        ];
    }
}
