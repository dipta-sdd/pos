<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE stock_transfers MODIFY COLUMN status ENUM('requested', 'accepted', 'in_transit', 'shipped', 'completed', 'cancelled', 'rejected') DEFAULT 'requested'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE stock_transfers MODIFY COLUMN status ENUM('draft', 'accepted', 'in_transit', 'completed', 'cancelled', 'rejected', 'requested') DEFAULT 'draft'");
    }
};
