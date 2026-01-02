<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Variant;

class VariantSeeder extends Seeder
{
    public function run(): void
    {
        Variant::factory()->count(10)->create();
    }
}
