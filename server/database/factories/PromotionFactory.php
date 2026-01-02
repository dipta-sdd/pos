<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Promotion;
use App\Models\Vendor;
use App\Models\Branch;
use App\Models\Product;
use App\Models\Category;
use App\Models\User;
use Carbon\Carbon;

class PromotionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'vendor_id' => Vendor::factory(),
            'branch_id' => Branch::factory(),
            'name' => $this->faker->sentence,
            'discount_type' => $this->faker->randomElement(['percentage', 'fixed_amount']),
            'discount_value' => $this->faker->randomFloat(2, 5, 50),
            'applies_to' => $this->faker->randomElement(['product', 'category']),
            'product_id' => null,
            'category_id' => null,
            'start_date' => Carbon::now(),
            'end_date' => Carbon::now()->addWeeks(2),
            'is_active' => true,
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
        ];
    }
}
