<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('receipt_settings', function (Blueprint $table) {
            $table->foreignId('vendor_id')->primary()->constrained('vendors')->onDelete('cascade');
            $table->text('header_text')->nullable();
            $table->text('footer_text')->nullable();
            $table->boolean('show_logo')->default(false);
            $table->boolean('show_address')->default(false);
            $table->boolean('show_contact_info')->default(false);
            $table->string('template_style')->default('default');
            $table->timestamps();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('receipt_settings');
    }
};