import React from "react";
import { clsx } from "clsx";

import { CartItem } from "@/lib/types/pos";

interface KeyboardCartItemProps {
  item: CartItem;
  index: number;
  isSelected: boolean;
  onUpdateQty: (itemId: string, updates: Partial<CartItem>) => void;
  onRemove: (itemId: string) => void;
}

export const KeyboardCartItem: React.FC<KeyboardCartItemProps> = ({
  item,
  index,
  isSelected,
  onUpdateQty,
  onRemove,
}) => {
  return (
    <tr
      className={clsx(
        "border-b border-gray-700 transition-colors",
        isSelected ? "bg-blue-900/40" : "hover:bg-gray-800/30",
      )}
    >
      <td className="py-2 px-3 text-sm text-gray-400">{index + 1}</td>
      <td className="py-2 px-3">
        <div className="font-medium text-white">{item.product.name}</div>
        <div className="text-xs text-gray-400">
          {item.variant.name} (Batch: {item.batch.id})
        </div>
      </td>
      <td className="py-2 px-3 text-right font-mono text-blue-400">
        {item.quantity}
      </td>
      <td className="py-2 px-3 text-right font-mono">
        {item.price.toLocaleString()}
      </td>
      <td className="py-2 px-3 text-right font-mono font-bold text-white">
        {item.total.toLocaleString()}
      </td>
    </tr>
  );
};
