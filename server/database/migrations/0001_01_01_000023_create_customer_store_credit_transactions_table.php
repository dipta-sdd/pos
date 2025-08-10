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
        Schema::create('customer_store_credit_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_credit_id')->constrained('customer_store_credits')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->enum('type', ['return_credit', 'redemption', 'manual_adjustment', 'goodwill']);
            $table->unsignedBigInteger('referenceable_id');
            $table->string('referenceable_type');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->index(['referenceable_type', 'referenceable_id'], 'cscrt_referenceable_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('credit_transactions');
    }
}; 