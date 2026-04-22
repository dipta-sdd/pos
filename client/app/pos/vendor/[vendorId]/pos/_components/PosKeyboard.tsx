"use client";

import { useEffect, useRef } from "react";
import { Button, Input, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Kbd } from "@heroui/react";
import { Search, ShoppingCart, CreditCard, User, Package, Minus, Plus, Trash2 } from "lucide-react";

import TabSection from "./TabSection";
import CartSection from "./CartSection"; // I'll reuse the table cart for now or make a more dense one
import PaymentSection from "./PaymentSection";

import { CashRegisterSession, Product, Variant, ProductStock } from "@/lib/types/general";
import { PosTab, CartItem, PosState } from "@/lib/types/pos";

interface PosKeyboardProps {
  state: PosState;
  activeTab: PosTab;
  activeSession: CashRegisterSession | null;
  isProcessing: boolean;
  view: "cart" | "payment";
  setView: (view: "cart" | "payment") => void;
  onOpen: () => void;
  focusItemId: string | null;
  setFocusItemId: (id: string | null) => void;
  addTab: () => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateActiveTab: (updates: Partial<PosTab>) => void;
  addToCart: (product: Product, variant: Variant, batch: ProductStock, quantity: number) => void;
  updateCartItem: (itemId: string, updates: Partial<CartItem>) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  handleCheckout: () => Promise<void>;
  handleProductSelect: (product: Product, variant: Variant, batch: ProductStock) => void;
}

export default function PosKeyboard({
  state,
  activeTab,
  activeSession,
  isProcessing,
  view,
  setView,
  onOpen,
  focusItemId,
  setFocusItemId,
  addTab,
  closeTab,
  setActiveTab,
  updateActiveTab,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  handleCheckout,
  handleProductSelect,
}: PosKeyboardProps) {
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus search on mount
    searchRef.current?.focus();

    const handleShortcuts = (e: KeyboardEvent) => {
      if (e.key === "F1") { e.preventDefault(); addTab(); }
      if (e.key === "F3") { e.preventDefault(); onOpen(); }
      if (e.key === "Escape") { setView("cart"); searchRef.current?.focus(); }
    };

    window.addEventListener("keydown", handleShortcuts);
    return () => window.removeEventListener("keydown", handleShortcuts);
  }, []);

  const total = activeTab.items.reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-black text-gray-300 font-mono overflow-hidden">
      {/* Top Status Bar (Ultra Dense) */}
      <div className="h-8 bg-gray-900 border-b border-gray-800 flex items-center px-4 justify-between text-[10px] uppercase tracking-tighter">
        <div className="flex items-center gap-4">
          <span className="text-primary font-black">TERMINAL: {activeSession?.billing_counter?.name || "OFFLINE"}</span>
          <span className="text-gray-500">USER: {activeSession?.user?.name || "N/A"}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{new Date().toLocaleDateString()}</span>
          <span className="bg-success/20 text-success px-1">STABLE</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Cart Table (Main focus) */}
        <div className="flex-1 flex flex-col border-r border-gray-800">
           {/* Tab Bar (Inline) */}
           <div className="bg-gray-900/50 flex border-b border-gray-800">
             {state.tabs.map(tab => (
               <button
                 key={tab.id}
                 className={`px-4 py-2 text-[10px] font-black border-r border-gray-800 transition-colors ${state.activeTabId === tab.id ? "bg-primary text-black" : "hover:bg-gray-800"}`}
                 onClick={() => setActiveTab(tab.id)}
               >
                 TAB {tab.id.slice(0,4)} | {tab.items.length}
               </button>
             ))}
             <button className="px-4 py-2 text-gray-500 hover:text-white" onClick={addTab}>[+] F1</button>
           </div>

           <div className="flex-1 overflow-hidden">
             {view === "cart" ? (
                <CartSection 
                  activeTab={activeTab}
                  focusItemId={focusItemId}
                  onCheckout={() => setView("payment")}
                  onClearCart={clearCart}
                  onFocusHandled={() => setFocusItemId(null)}
                  onRemoveItem={removeFromCart}
                  onUpdateItem={updateCartItem}
                  onUpdateTab={updateActiveTab}
                />
             ) : (
                <div className="p-10 max-w-xl mx-auto w-full">
                   <h2 className="text-2xl font-black mb-6 text-primary underline">CHECKOUT (F2)</h2>
                   <PaymentSection 
                      receivedAmount={activeTab.receivedAmount}
                      selectedMethodId={activeTab.selectedPaymentMethodId}
                      total={total}
                      onAmountChange={(amt) => updateActiveTab({ receivedAmount: amt })}
                      onMethodSelect={(id) => updateActiveTab({ selectedPaymentMethodId: id })}
                   />
                   <div className="mt-10 flex gap-4">
                      <Button className="flex-1 h-14 font-black" color="primary" radius="none" onPress={handleCheckout}>CONFIRM SALE</Button>
                      <Button className="h-14 px-8 font-black" variant="bordered" radius="none" onPress={() => setView("cart")}>CANCEL [ESC]</Button>
                   </div>
                </div>
             )}
           </div>
        </div>

        {/* Right: Command/Search Panel */}
        <div className="w-80 bg-gray-950 flex flex-col">
           <div className="p-4 border-b border-gray-800">
              <label className="text-[10px] text-primary block mb-1">SEARCH / SCAN [F4]</label>
              <Input
                ref={searchRef}
                className="font-mono"
                placeholder="Product SKU / Name..."
                radius="none"
                size="sm"
                startContent={<Search className="w-4 h-4 text-gray-500" />}
                variant="bordered"
              />
           </div>

           <div className="flex-1 p-4 space-y-4">
              <div className="space-y-1">
                 <span className="text-[10px] text-gray-500 block">CUSTOMER</span>
                 <div className="flex items-center gap-2 text-xs text-white">
                    <User className="w-3 h-3" />
                    {activeTab.customer?.name || "WALK-IN CUSTOMER"}
                 </div>
              </div>

              <div className="space-y-1">
                 <span className="text-[10px] text-gray-500 block">LAST ADDED</span>
                 <div className="p-2 border border-dashed border-gray-800 text-[10px]">
                    NO ITEMS IN SESSION
                 </div>
              </div>
           </div>

           {/* Large Summary Box */}
           <div className="p-6 bg-primary text-black">
              <span className="text-[10px] font-black block leading-none">TOTAL DUE</span>
              <span className="text-5xl font-black block tracking-tighter">${total.toFixed(2)}</span>
           </div>
        </div>
      </div>

      {/* Bottom Shortcut Bar */}
      <div className="h-10 bg-gray-900 border-t border-gray-800 flex items-center px-4 gap-6 text-[10px] font-black">
         <div className="flex items-center gap-2"><Kbd className="bg-gray-800 text-white rounded-none border-none">F1</Kbd> NEW TAB</div>
         <div className="flex items-center gap-2"><Kbd className="bg-gray-800 text-white rounded-none border-none">F2</Kbd> {view === "cart" ? "PAY" : "DONE"}</div>
         <div className="flex items-center gap-2"><Kbd className="bg-gray-800 text-white rounded-none border-none">F4</Kbd> SEARCH</div>
         <div className="flex items-center gap-2"><Kbd className="bg-gray-800 text-white rounded-none border-none">ESC</Kbd> CLEAR</div>
         <div className="ml-auto text-primary animate-pulse">● SYSTEM READY</div>
      </div>
    </div>
  );
}
