<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\PaymentMethod;
use App\Models\Vendor;
use App\Models\Branch;

class PaymentMethodFactory extends Factory
{
    public function definition(): array
    {
        return [
            'vendor_id' => Vendor::factory(),
            'branch_id' => Branch::factory(),
            'name' => $this->faker->creditCardType,
            'is_active' => $this->faker->boolean,
        ];
    }
}
