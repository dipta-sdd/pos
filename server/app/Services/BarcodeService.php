<?php

namespace App\Services;

use App\Models\Variant;
use Illuminate\Support\Facades\DB;

class BarcodeService
{
    // EAN-13 internal-use prefix (200–299 range is reserved for in-store use)
    const PREFIX = '200';

    /**
     * Generate a unique EAN-13 barcode and save it to the variant.
     */
    public function assignBarcode(Variant $variant): string
    {
        if ($variant->barcode) {
            return $variant->barcode; // already has one, skip
        }

        $barcode = DB::transaction(function () use ($variant) {
            $code = $this->generateUnique();
            $variant->barcode = $code;
            $variant->save();
            return $code;
        });

        return $barcode;
    }

    /**
     * Bulk assign barcodes to all variants that don't have one.
     */
    public function assignMissing(): int
    {
        $variants = Variant::whereNull('barcode')->get();
        foreach ($variants as $variant) {
            $this->assignBarcode($variant);
        }
        return $variants->count();
    }

    /**
     * Generate a unique EAN-13 barcode not already in the DB.
     */
    private function generateUnique(int $maxAttempts = 10): string
    {
        for ($i = 0; $i < $maxAttempts; $i++) {
            $code = $this->generateEAN13();
            $exists = Variant::where('barcode', $code)->lockForUpdate()->exists();
            if (!$exists) {
                return $code;
            }
        }
        throw new \RuntimeException('Could not generate a unique barcode after ' . $maxAttempts . ' attempts.');
    }

    /**
     * Build a valid EAN-13 with prefix 200 + 9 random digits + checksum.
     */
    private function generateEAN13(): string
    {
        // PREFIX(3) + random(9) = 12 digits, then append checksum digit
        $body = self::PREFIX . str_pad(random_int(0, 999999999), 9, '0', STR_PAD_LEFT);
        return $body . $this->ean13Checksum($body);
    }

    /**
     * Calculate the EAN-13 check digit.
     */
    private function ean13Checksum(string $digits12): string
    {
        $sum = 0;
        for ($i = 0; $i < 12; $i++) {
            $sum += (int)$digits12[$i] * ($i % 2 === 0 ? 1 : 3);
        }
        $check = (10 - ($sum % 10)) % 10;
        return (string)$check;
    }
}
