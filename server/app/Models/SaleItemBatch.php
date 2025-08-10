<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SaleItemBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_item_id',
        'inventory_batch_id',
        'quantity_sold',
        'buy_price_at_sale',
    ];

    protected $casts = [
        'quantity_sold' => 'decimal:2',
        'buy_price_at_sale' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function saleItem(): BelongsTo
    {
        return $this->belongsTo(SaleItem::class);
    }

    public function inventoryBatch(): BelongsTo
    {
        return $this->belongsTo(InventoryBatch::class);
    }
} 