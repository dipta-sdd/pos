<?php

namespace App\Models;

use App\Traits\LogsActivity;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockTransferItem extends Model
{
    use LogsActivity;
    use HasFactory;

    protected $fillable = [
        'stock_transfer_id',
        'variant_id',
        'product_stocks_id',
        'unit_of_measure_id',
        'quantity',
        'approved_quantity',
        'received_quantity',
        'cost_price',
        'selling_price',
        'expiry_date',
        'status',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'approved_quantity' => 'decimal:2',
        'received_quantity' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'expiry_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function stockTransfer(): BelongsTo
    {
        return $this->belongsTo(StockTransfer::class);
    }

    public function productStock(): BelongsTo
    {
        return $this->belongsTo(ProductStock::class, 'product_stocks_id');
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(Variant::class);
    }

    public function unitOfMeasure(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasure::class);
    }


}