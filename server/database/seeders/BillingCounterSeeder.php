<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BillingCounter;

class BillingCounterSeeder extends Seeder
{
    public function run(): void
    {
        BillingCounter::factory()->count(10)->create();
    }
}
