import React from "react";
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell 
} from "@heroui/react";
import { CartItem } from "@/lib/types/pos";
import { clsx } from "clsx";

interface KeyboardCartTableProps {
  items: CartItem[];
  selectedIndex: number;
  onUpdateQty: (itemId: string, updates: Partial<CartItem>) => void;
  onRemove: (itemId: string) => void;
}

export const KeyboardCartTable: React.FC<KeyboardCartTableProps> = ({
  items,
  selectedIndex,
}) => {
  return (
    <div className="flex-1 overflow-auto bg-black/5 rounded-xl border border-default-200">
      <Table 
        aria-label="POS Cart Table"
        isHeaderSticky
        removeWrapper
        className="h-full"
        classNames={{
          base: "max-h-full",
          table: "min-h-0", // Fix for the "half screen height" issue
          thead: "[&>tr]:first:rounded-none",
          th: "bg-default-100 text-default-500 text-[10px] font-black uppercase py-4 tracking-widest",
          td: "py-3 border-b border-default-100"
        }}
      >
        <TableHeader>
          <TableColumn width={50}>#</TableColumn>
          <TableColumn>ITEM DESCRIPTION</TableColumn>
          <TableColumn align="end" width={100}>QTY</TableColumn>
          <TableColumn align="end" width={150}>PRICE</TableColumn>
          <TableColumn align="end" width={150}>TOTAL</TableColumn>
        </TableHeader>
        <TableBody emptyContent={"No items in cart. Start scanning or press [F1]."}>
          {items.map((item, index) => (
            <TableRow 
              key={item.id}
              className={clsx(
                "transition-colors",
                index === selectedIndex ? "bg-primary/10" : ""
              )}
            >
              <TableCell>
                <span className="text-default-400 font-mono text-xs">{index + 1}</span>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-bold text-sm">{item.product.name}</span>
                  <span className="text-[10px] text-default-400 uppercase tracking-tight">
                    {item.variant.name} • Batch: {item.batch.id}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono font-bold text-primary">
                {item.quantity}
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
