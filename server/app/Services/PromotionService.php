<?php

namespace App\Services;

use App\Models\Promotion;
use App\Models\Variant;
use Carbon\Carbon;

class PromotionService
{
    /**
     * Calculate applicable promotions for a set of cart items.
     * 
     * @param int $vendorId
     * @param int|null $branchId
     * @param array $items Array of ['variant_id' => int, 'quantity' => float, 'price' => float]
     * @return array Array of ['item_index' => int, 'discount_amount' => float, 'promotion_id' => int]
     */
    public function calculateDiscounts(int $vendorId, ?int $branchId, array $items)
    {
        $discounts = [];
        $now = Carbon::now();

        // Fetch all active promotions for this vendor/branch
        $promotions = Promotion::where('vendor_id', $vendorId)
            ->where(function($q) use ($branchId) {
                $q->whereNull('branch_id')->orWhere('branch_id', $branchId);
            })
            ->where('is_active', true)
            ->where('start_date', '<=', $now)
            ->where(function($q) use ($now) {
                $q->whereNull('end_date')->orWhere('end_date', '>=', $now);
            })
            ->get();

        foreach ($promotions as $promo) {
            foreach ($items as $index => $item) {
                $applicable = false;

                // Check applicability
                if ($promo->applies_to === 'product' && $promo->variant_id == $item['variant_id']) {
                    $applicable = true;
                } elseif ($promo->applies_to === 'category') {
                    $variant = Variant::with('product')->find($item['variant_id']);
                    if ($variant && $variant->product->category_id == $promo->category_id) {
                        $applicable = true;
                    }
                } elseif ($promo->applies_to === 'entire_branch' || $promo->applies_to === 'entire_vendor') {
                    $applicable = true;
                }

                if ($applicable) {
                    $discountAmount = 0;

                    if ($promo->promotion_type === 'standard') {
                        // Standard percentage or fixed discount per unit
                        if ($promo->discount_type === 'percentage') {
                            $discountAmount = ($item['price'] * $promo->discount_value / 100) * $item['quantity'];
                        } else {
                            $discountAmount = $promo->discount_value * $item['quantity'];
                        }
                    } elseif ($promo->promotion_type === 'bogo') {
                        // Buy X Get Y Free/Discounted
                        // Example: Buy 2 Get 1 Free (buy_quantity=2, get_quantity=1, discount_value=100%)
                        $totalSets = floor($item['quantity'] / ($promo->buy_quantity + $promo->get_quantity));
                        $discountableQty = $totalSets * $promo->get_quantity;
                        
                        if ($promo->discount_type === 'percentage') {
                            $discountAmount = ($item['price'] * $promo->discount_value / 100) * $discountableQty;
                        } else {
                            $discountAmount = $promo->discount_value * $discountableQty;
                        }
                    }

                    if ($discountAmount > 0) {
                        $discounts[] = [
                            'item_index' => $index,
                            'discount_amount' => $discountAmount,
                            'promotion_id' => $promo->id,
                            'promotion_name' => $promo->name
                        ];
                    }
                }
            }
        }

        return $discounts;
    }
}
