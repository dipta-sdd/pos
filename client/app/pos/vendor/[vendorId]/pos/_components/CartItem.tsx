"use client";

import { useRef, useEffect } from "react";
import { Button, Input } from "@heroui/react";
import { Trash2, Package, Calendar } from "lucide-react";

import { CartItem } from "@/lib/types/pos";

interface CartItemProps {
  item: CartItem;
  onUpdate: (updates: Partial<CartItem>) => void;
  onRemove: () => void;
  focusQuantity: boolean;
  onFocusHandled: () => void;
}

export default function CartItemComponent({
  item,
  onUpdate,
  onRemove,
  focusQuantity,
  onFocusHandled,
}: CartItemProps) {
  const qtyRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusQuantity && qtyRef.current) {
      qtyRef.current.focus();
      qtyRef.current.select();
      onFocusHandled();
    }
  }, [focusQuantity]);

  return (
    <div className="group bg-white dark:bg-gray-800 p-3 rounded-xl border border-default-100 hover:border-primary-200 transition-all">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <p className="text-sm font-bold truncate">{item.product.name}</p>
          <p className="text-[10px] text-default-500 uppercase tracking-wider">
            {item.variant.name}
          </p>

          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1 text-[10px] bg-default-100 px-1.5 py-0.5 rounded text-default-600">
              <Package className="w-3 h-3" />
              Batch: {item.batch.id}
            </div>
            {item.batch.expiry_date && (
              <div className="flex items-center gap-1 text-[10px] bg-warning-50 px-1.5 py-0.5 rounded text-warning-700 font-medium">
                <Calendar className="w-3 h-3" />
                Exp: {item.batch.expiry_date}
              </div>
            )}
          </div>
        </div>
        <Button
          isIconOnly
          className="opacity-0 group-hover:opacity-100 text-danger transition-opacity"
          radius="full"
          size="sm"
          variant="light"
          onPress={onRemove}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="col-span-1">
          <p className="text-[9px] text-default-400 font-bold mb-1 uppercase">
            Price
          </p>
          <p className="text-sm font-mono font-bold">
            ${item.price.toFixed(2)}
          </p>
        </div>
        <div className="col-span-1">
          <p className="text-[9px] text-default-400 font-bold mb-1 uppercase">
            Qty
          </p>
          <Input
            ref={qtyRef}
            className="font-mono font-bold"
            size="sm"
            type="number"
            value={item.quantity.toString()}
            variant="bordered"
            onValueChange={(val) => onUpdate({ quantity: Number(val) || 0 })}
          />
        </div>
        <div className="col-span-1 text-right">
          <p className="text-[9px] text-default-400 font-bold mb-1 uppercase">
            Total
          </p>
          <p className="text-sm font-mono font-bold text-primary">
            ${item.total.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
