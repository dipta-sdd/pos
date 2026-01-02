<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\UnitOfMeasure;

class UnitOfMeasureSeeder extends Seeder
{
    public function run(): void
    {
        UnitOfMeasure::factory()->count(10)->create();
    }
}
