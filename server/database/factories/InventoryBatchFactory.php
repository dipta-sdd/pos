<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\InventoryBatch;
use App\Models\BranchProduct;
use App\Models\PurchaseOrderItem;
use App\Models\User;

class InventoryBatchFactory extends Factory
{
    public function definition(): array
    {
        return [
            'branch_product_id' => BranchProduct::factory(),
            'purchase_order_item_id' => PurchaseOrderItem::factory(),
            'buy_price' => $this->faker->randomFloat(2, 10, 100),
            'initial_quantity' => $this->faker->numberBetween(50, 200),
            'quantity_on_hand' => $this->faker->numberBetween(10, 50),
            'expiry_date' => $this->faker->dateTimeThisYear()->modify('+1 year'),
            'batch_number' => $this->faker->unique()->ean8,
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
        ];
    }
}
