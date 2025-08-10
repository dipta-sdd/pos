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
        Schema::create('cash_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cash_register_session_id')->constrained('cash_register_sessions')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->enum('type', ['sale_payment', 'refund', 'cash_in', 'cash_out', 'transfer_out_to_branch', 'transfer_in_from_branch']);
            $table->text('notes')->nullable();
            $table->boolean('is_reversal')->default(false);
            $table->foreignId('reverses_transaction_id')->nullable()->constrained('cash_transactions')->onDelete('set null');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_transactions');
    }
}; 