<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ReceiptSettings;

class ReceiptSettingsSeeder extends Seeder
{
    public function run(): void
    {
        ReceiptSettings::factory()->count(10)->create();
    }
}
