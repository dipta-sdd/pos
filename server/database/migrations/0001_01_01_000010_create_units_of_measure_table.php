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
        Schema::create('units_of_measure', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->nullable()->constrained('vendors')->onDelete('cascade');
            $table->string('name');
            $table->string('abbreviation');
            $table->boolean('is_decimal_allowed')->default(false);
            $table->timestamps();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            
            $table->unique(['vendor_id', 'name']);
            $table->unique(['vendor_id', 'abbreviation']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('units_of_measure');
    }
}; 


// INSERT INTO `units_of_measure` (`id`, `name`, `abbreviation`, `is_decimal_allowed`, `created_at`, `updated_at`, `created_by`, `updated_by`) VALUES
// -- 1. General Count (Standard Retail)
// (1, 'Piece', 'pcs', 0, NOW(), NOW(), 1, 1),
// (2, 'Pack', 'pk', 0, NOW(), NOW(), 1, 1),
// (3, 'Box', 'bx', 0, NOW(), NOW(), 1, 1),
// (4, 'Dozen', 'dz', 0, NOW(), NOW(), 1, 1),
// (5, 'Case', 'cs', 0, NOW(), NOW(), 1, 1),
// (6, 'Each', 'ea', 0, NOW(), NOW(), 1, 1),
// (7, 'Set', 'set', 0, NOW(), NOW(), 1, 1),
// (8, 'Pair', 'pr', 0, NOW(), NOW(), 1, 1),
// (9, 'Unit', 'u', 0, NOW(), NOW(), 1, 1),

// -- 2. Weight (Metric & Imperial)
// (10, 'Kilogram', 'kg', 1, NOW(), NOW(), 1, 1),
// (11, 'Gram', 'g', 1, NOW(), NOW(), 1, 1),
// (12, 'Milligram', 'mg', 1, NOW(), NOW(), 1, 1),
// (13, 'Metric Ton', 't', 1, NOW(), NOW(), 1, 1),
// (14, 'Pound', 'lb', 1, NOW(), NOW(), 1, 1),
// (15, 'Ounce', 'oz', 1, NOW(), NOW(), 1, 1),

// -- 3. Volume (Liquid & Dry)
// (16, 'Liter', 'L', 1, NOW(), NOW(), 1, 1),
// (17, 'Milliliter', 'ml', 1, NOW(), NOW(), 1, 1),
// (18, 'Gallon', 'gal', 1, NOW(), NOW(), 1, 1),
// (19, 'Quart', 'qt', 1, NOW(), NOW(), 1, 1),
// (20, 'Pint', 'pt', 1, NOW(), NOW(), 1, 1),
// (21, 'Cup', 'cup', 1, NOW(), NOW(), 1, 1),
// (22, 'Fluid Ounce', 'fl oz', 1, NOW(), NOW(), 1, 1),
// (23, 'Barrel', 'bbl', 1, NOW(), NOW(), 1, 1),

// -- 4. Length & Area (Textiles/Construction)
// (24, 'Meter', 'm', 1, NOW(), NOW(), 1, 1),
// (25, 'Centimeter', 'cm', 1, NOW(), NOW(), 1, 1),
// (26, 'Millimeter', 'mm', 1, NOW(), NOW(), 1, 1),
// (27, 'Inch', 'in', 1, NOW(), NOW(), 1, 1),
// (28, 'Foot', 'ft', 1, NOW(), NOW(), 1, 1),
// (29, 'Yard', 'yd', 1, NOW(), NOW(), 1, 1),
// (30, 'Square Meter', 'sqm', 1, NOW(), NOW(), 1, 1),
// (31, 'Square Foot', 'sqft', 1, NOW(), NOW(), 1, 1),
// (32, 'Acre', 'ac', 1, NOW(), NOW(), 1, 1),

// -- 5. Food & Hospitality (Restaurants/Bars)
// (33, 'Bottle', 'btl', 0, NOW(), NOW(), 1, 1),
// (34, 'Glass', 'gl', 0, NOW(), NOW(), 1, 1),
// (35, 'Shot', 'st', 0, NOW(), NOW(), 1, 1),
// (36, 'Can', 'cn', 0, NOW(), NOW(), 1, 1),
// (37, 'Portion', 'port', 1, NOW(), NOW(), 1, 1),
// (38, 'Plate', 'pl', 0, NOW(), NOW(), 1, 1),
// (39, 'Tablespoon', 'tbsp', 1, NOW(), NOW(), 1, 1),
// (40, 'Teaspoon', 'tsp', 1, NOW(), NOW(), 1, 1),

// -- 6. Industrial, Agriculture & Bulk
// (41, 'Pallet', 'plt', 0, NOW(), NOW(), 1, 1),
// (42, 'Roll', 'rl', 1, NOW(), NOW(), 1, 1),
// (43, 'Bundle', 'bdl', 0, NOW(), NOW(), 1, 1),
// (44, 'Sheet', 'sh', 1, NOW(), NOW(), 1, 1),
// (45, 'Bale', 'bl', 0, NOW(), NOW(), 1, 1),
// (46, 'Bushel', 'bu', 1, NOW(), NOW(), 1, 1),
// (47, 'Bunch', 'bn', 0, NOW(), NOW(), 1, 1),
// (48, 'Head', 'hd', 0, NOW(), NOW(), 1, 1),
// (49, 'Crate', 'crt', 0, NOW(), NOW(), 1, 1),
// (50, 'Drum', 'dr', 1, NOW(), NOW(), 1, 1),
// (51, 'Ream', 'rm', 0, NOW(), NOW(), 1, 1),

// -- 7. Time & Service (Billing)
// (52, 'Hour', 'hr', 1, NOW(), NOW(), 1, 1),
// (53, 'Day', 'day', 1, NOW(), NOW(), 1, 1),
// (54, 'Week', 'wk', 1, NOW(), NOW(), 1, 1),
// (55, 'Month', 'mo', 0, NOW(), NOW(), 1, 1),
// (56, 'Session', 'sess', 0, NOW(), NOW(), 1, 1),
// (57, 'Person', 'ppl', 0, NOW(), NOW(), 1, 1),

// -- 8. Digital & Technology
// (58, 'Gigabyte', 'GB', 1, NOW(), NOW(), 1, 1),
// (59, 'Megabyte', 'MB', 1, NOW(), NOW(), 1, 1),
// (60, 'User', 'usr', 0, NOW(), NOW(), 1, 1),
// (61, 'License', 'lic', 0, NOW(), NOW(), 1, 1),

// -- 9. Medical/Pharmacy
// (62, 'Tablet', 'tab', 0, NOW(), NOW(), 1, 1),
// (63, 'Capsule', 'cap', 0, NOW(), NOW(), 1, 1),
// (64, 'Vial', 'vl', 0, NOW(), NOW(), 1, 1),

// -- 10. Energy
// (65, 'Kilowatt-hour', 'kWh', 1, NOW(), NOW(), 1, 1);