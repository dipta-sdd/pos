<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\CustomerStoreCredit;
use App\Models\Customer;
use App\Models\User;

class CustomerStoreCreditFactory extends Factory
{
    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'current_balance' => $this->faker->randomFloat(2, 0, 1000),
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
        ];
    }
}
