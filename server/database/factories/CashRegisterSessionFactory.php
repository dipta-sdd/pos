<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\CashRegisterSession;
use App\Models\BillingCounter;
use App\Models\User;
use Carbon\Carbon;

class CashRegisterSessionFactory extends Factory
{
    public function definition(): array
    {
        $opening_balance = $this->faker->randomFloat(2, 100, 500);
        $closing_balance = $this->faker->randomFloat(2, 1000, 2000);
        $calculated_cash = $closing_balance - $this->faker->randomFloat(2, -50, 50);

        return [
            'billing_counter_id' => BillingCounter::factory(),
            'user_id' => User::factory(),
            'opening_balance' => $opening_balance,
            'closing_balance' => $closing_balance,
            'calculated_cash' => $calculated_cash,
            'discrepancy' => $calculated_cash - $closing_balance,
            'started_at' => Carbon::now()->subHours(8),
            'ended_at' => Carbon::now(),
            'status' => 'closed',
        ];
    }
}
