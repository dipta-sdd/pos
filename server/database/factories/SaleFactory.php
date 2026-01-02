<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Sale;
use App\Models\Vendor;
use App\Models\Branch;
use App\Models\User;
use App\Models\BillingCounter;
use App\Models\CashRegisterSession;
use App\Models\Customer;

class SaleFactory extends Factory
{
    public function definition(): array
    {
        $subtotal = $this->faker->randomFloat(2, 50, 1000);
        $discount = $this->faker->randomFloat(2, 0, $subtotal * 0.2);
        $tax = ($subtotal - $discount) * 0.1;

        return [
            'vendor_id' => Vendor::factory(),
            'branch_id' => Branch::factory(),
            'user_id' => User::factory(),
            'billing_counter_id' => BillingCounter::factory(),
            'cash_register_session_id' => CashRegisterSession::factory(),
            'customer_id' => Customer::factory(),
            'subtotal_amount' => $subtotal,
            'total_discount_amount' => $discount,
            'tax_amount' => $tax,
            'final_amount' => $subtotal - $discount + $tax,
            'status' => 'completed',
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
        ];
    }
}
