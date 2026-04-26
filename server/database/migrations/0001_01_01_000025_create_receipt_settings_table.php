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
            $table->boolean('show_address')->default(true);
            $table->boolean('show_contact_info')->default(true);
            $table->string('template_style')->default('default');
            $table->enum('font_size', ['small', 'medium', 'large'])->default('medium');
            $table->boolean('show_tax_breakdown')->default(true);
            $table->boolean('show_payment_details')->default(true);
            $table->boolean('show_barcode')->default(false);
            $table->boolean('show_salesperson')->default(true);
            $table->boolean('show_sale_id')->default(true);
            $table->boolean('show_date_time')->default(true);
            $table->boolean('show_item_qty')->default(true);
            $table->boolean('show_item_price')->default(true);
            $table->boolean('show_item_unit')->default(false);
            $table->boolean('show_item_discount')->default(false);
            $table->boolean('show_item_tax')->default(false);
            $table->boolean('show_item_total')->default(true);

            // Custom Labels
            $table->string('label_item')->nullable();
            $table->string('label_qty')->nullable();
            $table->string('label_price')->nullable();
            $table->string('label_unit')->nullable();
            $table->string('label_total')->nullable();

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