<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Expense;
use App\Models\Vendor;
use App\Models\Branch;
use App\Models\ExpenseCategory;
use App\Models\User;

class ExpenseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'vendor_id' => Vendor::factory(),
            'branch_id' => Branch::factory(),
            'expense_category_id' => ExpenseCategory::factory(),
            'amount' => $this->faker->randomFloat(2, 10, 500),
            'description' => $this->faker->sentence,
            'expense_date' => $this->faker->dateTimeThisMonth(),
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
        ];
    }
}
