<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\PurchaseOrder;
use App\Models\Vendor;
use App\Models\Supplier;
use App\Models\Branch;
use App\Models\User;

class PurchaseOrderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'vendor_id' => Vendor::factory(),
            'supplier_id' => Supplier::factory(),
            'branch_id' => Branch::factory(),
            'status' => $this->faker->randomElement(['pending', 'received', 'cancelled']),
            'total_amount' => $this->faker->randomFloat(2, 100, 2000),
            'paid_amount' => $this->faker->randomFloat(2, 0, 2000),
            'order_date' => $this->faker->dateTimeThisMonth(),
            'expected_delivery_date' => $this->faker->dateTimeThisMonth()->modify('+2 weeks'),
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
        ];
    }
}
