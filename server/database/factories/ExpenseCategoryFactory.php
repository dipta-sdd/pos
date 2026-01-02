<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\ExpenseCategory;
use App\Models\Vendor;
use App\Models\User;

class ExpenseCategoryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'vendor_id' => Vendor::factory(),
            'name' => $this->faker->word,
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
        ];
    }
}
