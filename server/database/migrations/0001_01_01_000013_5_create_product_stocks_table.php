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
            $table->foreignId('variant_id')->nullable()->constrained('variants')->onDelete('cascade');
            $table->decimal('quantity', 10, 2)->default(0);
            $table->decimal('cost_price', 10, 2)->default(0)->comment('Buy Price');
            $table->decimal('selling_price', 10, 2)->default(0)->comment('Sell Price');
            $table->timestamps();
            
            // Unique constraint to ensure one stock record per product/variant per branch
            $table->unique(['branch_id', 'product_id', 'variant_id']);
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
