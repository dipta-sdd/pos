<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CustomerStoreCredit;

class CustomerStoreCreditSeeder extends Seeder
{
    public function run(): void
    {
        CustomerStoreCredit::factory()->count(10)->create();
    }
}
