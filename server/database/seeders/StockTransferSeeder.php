<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\StockTransfer;

class StockTransferSeeder extends Seeder
{
    public function run(): void
    {
        StockTransfer::factory()->count(10)->create();
    }
}
