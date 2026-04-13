<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('variant_id')->constrained('variants')->onDelete('cascade');
            $table->foreignId('branch_product_id')->nullable()->constrained('branch_products')->onDelete('set null');
            $table->decimal('quantity', 10, 2)->default(0);
            $table->decimal('cost_price', 10, 2)->default(0)->comment('Buy Price');
            $table->decimal('selling_price', 10, 2)->default(0)->comment('Sell Price');
            $table->date('expiry_date')->nullable();
            // insteed of unit_of_measure_id save name and abbreviation because if unit we need to track unit for separate stocks 
            $table->string('unit_of_measure_name')->nullable();
            $table->string('unit_of_measure_abbreviation')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_stocks');
    }
};
