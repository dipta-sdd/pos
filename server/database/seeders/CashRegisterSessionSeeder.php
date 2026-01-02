<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CashRegisterSession;

class CashRegisterSessionSeeder extends Seeder
{
    public function run(): void
    {
        CashRegisterSession::factory()->count(10)->create();
    }
}
