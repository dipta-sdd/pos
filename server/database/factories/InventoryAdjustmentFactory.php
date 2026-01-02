<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\InventoryAdjustment;
use App\Models\InventoryBatch;
use App\Models\User;

class InventoryAdjustmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'inventory_batch_id' => InventoryBatch::factory(),
            'user_id' => User::factory(),
            'quantity_changed' => $this->faker->randomFloat(2, -10, 10),
            'reason' => $this->faker->sentence,
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
        ];
    }
}
