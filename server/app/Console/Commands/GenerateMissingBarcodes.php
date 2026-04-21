<?php

namespace App\Console\Commands;

use App\Services\BarcodeService;
use Illuminate\Console\Command;

class GenerateMissingBarcodes extends Command
{
    protected $signature   = 'barcodes:generate-missing';
    protected $description = 'Generate EAN-13 barcodes for all variants that do not have one';

    public function handle(BarcodeService $barcodeService)
    {
        $this->info('Generating missing barcodes...');
        $count = $barcodeService->assignMissing();
        $this->info("Done! Assigned barcodes to {$count} variant(s).");
    }
}
