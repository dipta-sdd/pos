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
        Schema::create('vendor_onboarding_steps', function (Blueprint $table) {
            $table->foreignId('vendor_id')->primary()->constrained('vendors')->onDelete('cascade');
            $table->boolean('has_created_branch')->default(false);
            $table->boolean('has_created_product')->default(false);
            $table->boolean('has_invited_staff')->default(false);
            $table->boolean('has_completed_wizard')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_onboarding_steps');
    }
}; 