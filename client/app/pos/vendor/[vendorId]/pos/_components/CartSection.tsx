"use client";

import {
  Button,
  ScrollShadow,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Tooltip,
} from "@heroui/react";
import { ShoppingCart, Trash2, CreditCard, Minus, Plus, X } from "lucide-react";

import CustomerSelector from "./CustomerSelector";

import { PosTab, CartItem } from "@/lib/types/pos";

interface CartSectionProps {
  activeTab: PosTab;
  focusItemId: string | null;
  onUpdateTab: (updates: Partial<PosTab>) => void;
  onUpdateItem: (itemId: string, updates: Partial<CartItem>) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onFocusHandled: () => void;
  onCheckout: () => void;
}

export default function CartSection({
  activeTab,
  focusItemId,
  onUpdateTab,
  onUpdateItem,
  onRemoveItem,
  onClearCart,
  onFocusHandled,
  onCheckout,
}: CartSectionProps) {
  const subtotal = activeTab.items.reduce(
    (sum, item) => sum + item.subtotal,
    0,
  );
  const tax = activeTab.items.reduce((sum, item) => sum + item.tax_amount, 0);
  const total = activeTab.items.reduce((sum, item) => sum + item.total, 0);

  const columns = [
    { name: "PRODUCT", uid: "product" },
    { name: "PRICE", uid: "price" },
    { name: "QTY", uid: "quantity" },
    { name: "TOTAL", uid: "total" },
    { name: "", uid: "actions" },
  ];

  const renderCell = (item: CartItem, columnKey: React.Key) => {
    switch (columnKey) {
      case "product":
        return (
          <div className="flex flex-col">
            <span className="font-bold text-sm truncate max-w-[150px]">
              {item.variant.name || item.product.name}
            </span>
            <span className="text-[10px] text-default-400">
              Batch: {item.batch.id} (Exp: {item.batch.expiry_date || "N/A"})
            </span>
          </div>
        );
      case "price":
        return (
          <span className="font-mono text-sm">${item.price.toFixed(2)}</span>
        );
      case "quantity":
        return (
          <div className="flex items-center gap-1">
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              onPress={() =>
                onUpdateItem(item.id, {
                  quantity: Math.max(1, item.quantity - 1),
                })
              }
            >
              <Minus className="w-3 h-3" />
            </Button>
            <Input
              ref={(el: HTMLInputElement | null) => {
                if (focusItemId === item.id && el) {
                  el.focus();
                }
              }}
              className="w-12 text-center"
              size="sm"
              type="number"
              value={item.quantity.toString()}
              variant="bordered"
              onFocus={(e) => {
                e.target.select();
                onFocusHandled();
              }}
              onValueChange={(val) =>
                onUpdateItem(item.id, { quantity: Number(val) || 1 })
              }
            />
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              onPress={() =>
                onUpdateItem(item.id, { quantity: item.quantity + 1 })
              }
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        );
      case "total":
        return (
          <span className="font-black text-sm text-primary font-mono">
            ${item.total.toFixed(2)}
          </span>
        );
      case "actions":
        return (
          <Tooltip color="danger" content="Remove">
            <Button
              isIconOnly
              color="danger"
              size="sm"
              variant="light"
              onPress={() => onRemoveItem(item.id)}
            >
              <X className="w-4 h-4" />
            </Button>
          </Tooltip>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Header with Customer Selector */}
      <div className="p-4 border-b border-default-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black flex items-center gap-2 text-xl tracking-tight">
            <ShoppingCart className="w-6 h-6 text-primary" />
            ACTIVE CART
            <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full ml-2">
              {activeTab.items.length} Items
            </span>
          </h2>
          <Button
            color="danger"
            size="sm"
            startContent={<Trash2 className="w-4 h-4" />}
            variant="flat"
            onPress={onClearCart}
          >
            Reset
          </Button>
        </div>
        <CustomerSelector
          selectedCustomer={activeTab.customer}
          onSelect={(c) => onUpdateTab({ customer: c })}
        />
      </div>

      {/* Cart Table Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab.items.length > 0 ? (
          <ScrollShadow className="h-full">
            <Table
              removeWrapper
              aria-label="Cart items table"
              className="min-w-full"
              selectionMode="none"
            >
              <TableHeader columns={columns}>
                {(column) => (
                  <TableColumn
                    key={column.uid}
                    align={column.uid === "actions" ? "center" : "start"}
                    className="bg-default-50 text-[10px] font-black uppercase tracking-widest text-default-400"
                  >
                    {column.name}
                  </TableColumn>
                )}
              </TableHeader>
              <TableBody items={activeTab.items}>
                {(item) => (
                  <TableRow
                    key={item.id}
                    className="border-b border-default-50 hover:bg-default-50 transition-colors"
                  >
                    {(columnKey) => (
                      <TableCell>{renderCell(item, columnKey)}</TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollShadow>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-default-300 text-center p-10">
            <ShoppingCart className="w-20 h-20 mb-4 opacity-5" />
            <p className="text-lg font-bold">Cart is Empty</p>
            <p className="text-xs">Scan items to start a sale</p>
          </div>
        )}
      </div>

      {/* Footer / Summary Area */}
      <div className="p-6 border-t border-default-100 bg-default-50/50">
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex justify-between items-center text-default-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Subtotal
            </span>
            <span className="font-mono font-bold">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-default-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Taxes
            </span>
            <span className="font-mono font-bold">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-end pt-2 border-t border-default-100">
            <div>
              <span className="text-[10px] font-black text-primary uppercase block tracking-tighter">
                Amount Due
              </span>
              <span className="text-4xl font-black text-primary font-mono tracking-tighter leading-none">
                ${total.toFixed(2)}
              </span>
            </div>
            <Button
              className="h-14 px-8 text-lg font-black shadow-xl shadow-primary/20"
              color="primary"
              isDisabled={activeTab.items.length === 0}
              size="lg"
              startContent={<CreditCard className="w-5 h-5" />}
              onPress={onCheckout}
            >
              PAY NOW (F2)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
