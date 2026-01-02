<?php

use Illuminate.Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('branch_products', function (Blueprint $table) {
            $table->foreignId('variant_id')->constrained('variants')->onDelete('cascade');
            $table->dropUnique(['branch_id', 'product_id']);
            $table->unique(['branch_id', 'product_id', 'variant_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('branch_products', function (Blueprint $table) {
            $table->dropUnique(['branch_id', 'product_id', 'variant_id']);
            $table->dropForeign(['variant_id']);
            $table->dropColumn('variant_id');
            $table->unique(['branch_id', 'product_id']);
        });
    }
};
