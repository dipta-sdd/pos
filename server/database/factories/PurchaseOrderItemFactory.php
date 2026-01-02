<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\PurchaseOrderItem;
use App\Models\PurchaseOrder;
use App\Models\Product;
use App\Models\Variant;
use App\Models\User;

class PurchaseOrderItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'purchase_order_id' => PurchaseOrder::factory(),
            'product_id' => Product::factory(),
            'variant_id' => Variant::factory(),
            'quantity_ordered' => $this->faker->numberBetween(10, 100),
            'quantity_received' => $this->faker->numberBetween(0, 100),
            'unit_cost' => $this->faker->randomFloat(2, 5, 50),
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
        ];
    }
}
