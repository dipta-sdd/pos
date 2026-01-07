<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\SaleItem;
use App\Models\Sale;
use App\Models\Variant;
use App\Models\ProductStock;
use App\Models\BranchProduct;
use App\Models\User;

class SaleItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'sale_id' => Sale::factory(),
            'variant_id' => Variant::factory(),
            'product_stock_id' => ProductStock::factory(),
            'quantity' => $this->faker->numberBetween(1, 10),
            'buy_price' => $this->faker->randomFloat(2, 10, 50),
            'sell_price_at_sale' => $this->faker->randomFloat(2, 20, 100),
            'discount_amount' => 0,
            'tax_amount' => 0,
            'tax_rate_applied' => 0,
            'line_total' => function (array $attributes) {
                return $attributes['quantity'] * $attributes['sell_price_at_sale'];
            },
            'unit_of_measure_id' => null,
            'other' => null,
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
        ];
    }
}
