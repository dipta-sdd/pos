<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InventoryAdjustment;

class InventoryAdjustmentSeeder extends Seeder
{
    public function run(): void
    {
        InventoryAdjustment::factory()->count(10)->create();
    }
}
