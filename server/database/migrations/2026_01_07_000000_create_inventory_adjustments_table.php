<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_adjustments', function (Blueprint ) {
            $column->id();
            $column->foreignId('vendor_id')->constrained()->onDelete('cascade');
            $column->foreignId('variant_id')->constrained()->onDelete('cascade');
            $column->decimal('quantity', 15, 2);
            $column->enum('type', ['addition', 'subtraction']);
            $column->text('reason');
            $column->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $column->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_adjustments');
    }
};
