import React, { useEffect, useRef } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
} from "@heroui/react";
import { clsx } from "clsx";
import { Plus, Minus } from "lucide-react";

import { CartItem } from "@/lib/types/pos";

interface KeyboardCartTableProps {
  items: CartItem[];
  selectedIndex: number;
  onUpdateQty: (itemId: string, updates: Partial<CartItem>) => void;
  onRemove: (itemId: string) => void;
  focusArea: string;
  onEsc: () => void;
}

const QuantityCell = ({ 
  item, 
  onUpdateQty, 
  onEsc, 
}: { 
  item: CartItem; 
  onUpdateQty: any; 
  onEsc: any;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);


  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        isIconOnly
        size="sm"
        variant="flat"
        onPress={() => onUpdateQty(item.id, { quantity: Math.max(1, item.quantity - 1) })}
      >
        <Minus size={14} />
      </Button>
      <input
        ref={inputRef}
        type="number"
        className="w-16 h-8 text-center font-mono font-bold bg-default-100 border-2 border-transparent focus:border-primary outline-none rounded-lg transition-all"
        value={item.quantity || ""}
        onChange={(e) => {
          const val = e.target.value;
          
          if (val === "") {
            onUpdateQty(item.id, { quantity: 0 });
            return;
          }

          const q = parseInt(val);

          if (!isNaN(q)) {
            onUpdateQty(item.id, { quantity: q });
          }
        }}
        onKeyDown={(e) => {
          // Stop propagation for keys that have global meanings in KeyboardPOS
          if (["ArrowUp", "ArrowDown", "Delete"].includes(e.key)) {
            e.stopPropagation();
          }

          if (e.key === "Enter" || e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            onEsc();
          }
        }}
      />
      <Button
        isIconOnly
        size="sm"
        variant="flat"
        onPress={() => onUpdateQty(item.id, { quantity: item.quantity + 1 })}
      >
        <Plus size={14} />
      </Button>
    </div>
  );
};

export const KeyboardCartTable: React.FC<KeyboardCartTableProps> = ({
  items,
  selectedIndex,
  onUpdateQty,
  focusArea,
  onEsc,
}) => {
  return (
    <div className="flex-1 overflow-auto bg-black/5 rounded-xl border border-default-200">
      <Table
        isHeaderSticky
        removeWrapper
        aria-label="POS Cart Table"
        className="h-full"
        classNames={{
          base: "max-h-full",
          table: "min-h-0",
          thead: "[&>tr]:first:rounded-none",
          th: "bg-default-100 text-default-500 text-[10px] font-black uppercase py-4 tracking-widest",
          td: "py-3 border-b border-default-100",
        }}
      >
        <TableHeader>
          <TableColumn width={50}>#</TableColumn>
          <TableColumn>ITEM DESCRIPTION</TableColumn>
          <TableColumn align="center" width={180}>
            QTY
          </TableColumn>
          <TableColumn align="end" width={150}>
            PRICE
          </TableColumn>
          <TableColumn align="end" width={150}>
            TOTAL
          </TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={"No items in cart. Start scanning or press [F1]."}
        >
          {(items || []).map((item, index) => (
            <TableRow
              key={item.id}
              className={clsx(
                "transition-colors",
                index === selectedIndex ? "bg-primary/10" : "",
              )}
            >
              <TableCell>
                <span className="text-default-400 font-mono text-xs">
                  {index + 1}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-bold text-sm">{item.product.name}</span>
                  <span className="text-[10px] text-default-400 uppercase tracking-tight">
                    {item.variant.name} • Batch: {item.batch.id}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <QuantityCell 
                  item={item}
                  onEsc={onEsc}
                  onUpdateQty={onUpdateQty}
                />
              </TableCell>
              <TableCell className="text-right font-mono">
                {item.price.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-mono font-bold">
                {item.total.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
