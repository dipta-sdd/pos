"use client";

import React, { useState, useEffect } from "react";
import {
  Tabs,
  Tab,
  Button,
  Card,
  CardBody,
  Divider,
} from "@heroui/react";
import { toast } from "sonner";

import { KeyboardSearch } from "./KeyboardSearch";
import { KeyboardCartTable } from "./KeyboardCartTable";
import { KeyboardPayment } from "./KeyboardPayment";
import { KeyboardCustomer } from "./KeyboardCustomer";

import { usePosState } from "@/lib/hooks/usePosState";
import api from "@/lib/api";
import { PaymentMethod } from "@/lib/types/general";

interface KeyboardPOSProps {
  vendorId: string;
}

export const KeyboardPOS: React.FC<KeyboardPOSProps> = ({ vendorId }) => {
  const {
    activeTab,
    state,
    addToCart,
    updateCartItem,
    removeFromCart,
    addPayment,
    updatePayment,
    removePayment,
    addTab,
    setActiveTab,
    updateActiveTab,
  } = usePosState();

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [focusArea, setFocusArea] = useState<"search" | "cart" | "payment" | "customer">(
    "search",
  );

  // Derived state
  const subtotal = activeTab ? activeTab.items.reduce((sum, item) => sum + item.subtotal, 0) : 0;
  const totalTax = activeTab ? activeTab.items.reduce((sum, item) => sum + item.tax_amount, 0) : 0;
  const grandTotal = activeTab ? activeTab.items.reduce((sum, item) => sum + item.total, 0) : 0;
  const totalApplied = activeTab ? activeTab.payments.reduce((sum, p) => sum + p.appliedAmount, 0) : 0;
  const remaining = grandTotal - totalApplied;

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const res: any = await api.get(`/payment-methods?vendor_id=${vendorId}`);
        setPaymentMethods(res.data.data || []);
      } catch (err) {
        toast.error("Failed to load payment methods");
      }
    };
    fetchMethods();
  }, [vendorId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F1") { e.preventDefault(); setFocusArea("search"); }
      if (e.key === "F2") { e.preventDefault(); setFocusArea("customer"); }
      if (e.key === "F4") { e.preventDefault(); addTab(); }
      if (e.key === "F8") { e.preventDefault(); setFocusArea("payment"); }

      if (e.altKey && !isNaN(parseInt(e.key))) {
        e.preventDefault();
        const num = parseInt(e.key);
        const method = paymentMethods[num - 1];
        if (method && activeTab) {
          const isCash = method.name.toLowerCase().includes("cash");
          addPayment({
            methodId: method.id,
            methodName: method.name,
            isCash,
            tenderedAmount: remaining > 0 ? remaining : 0,
            appliedAmount: remaining > 0 ? remaining : 0,
            changeAmount: 0
          });
          setFocusArea("payment");
        }
      }

      if (focusArea === "cart" && activeTab) {
        if (e.key === "ArrowDown") setSelectedIndex(prev => Math.min(prev + 1, activeTab.items.length - 1));
        if (e.key === "ArrowUp") setSelectedIndex(prev => Math.max(prev - 1, 0));
        if (e.key === "Delete" && activeTab.items[selectedIndex]) removeFromCart(activeTab.items[selectedIndex].id);
      }

      if (e.key === "Escape") setFocusArea("search");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusArea, activeTab, paymentMethods, remaining, addTab, addPayment, removeFromCart, selectedIndex]);

  if (!activeTab) return null;

  const handleProductSearch = async (query: string): Promise<any[]> => {
    if (!query) return [];
    try {
      const res: any = await api.get(`/branch-products?search=${query}`);
      return res.data.data || [];
    } catch (err) {
      return [];
    }
  };

  const handleProductSelect = async (item: any) => {
    try {
      const batchRes: any = await api.get(`/branch-products/stocks?variant_id=${item.id}`);
      const batches = batchRes.data || [];

      if (batches.length > 0) {
        const productObj: any = { id: item.product_id, name: item.product_name, image_url: item.image_url };
        const variantObj: any = { 
          id: item.id, 
          name: item.variant_name, 
          value: item.variant_value, 
          sku: item.sku, 
          barcode: item.barcode 
        };

        addToCart(productObj, variantObj, batches[0], 1);
        setFocusArea("search"); // Stay on search for scanning flow
        toast.success(`Added ${item.product_name}`);
      } else {
        toast.error("No stock available");
      }
    } catch (err) {
      toast.error("Failed to add product");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-content1 text-foreground overflow-hidden">
      {/* Sale Tabs */}
      <div className="flex items-center px-4 pt-2 bg-default-50 border-b border-default-200">
        <Tabs 
          aria-label="POS Tabs" 
          variant="underlined" 
          color="primary"
          selectedKey={activeTab.id}
          onSelectionChange={(key) => setActiveTab(key as string)}
          classNames={{
            tabList: "gap-6 h-10",
            cursor: "w-full bg-primary",
            tab: "max-w-fit px-0 h-10",
            tabContent: "group-data-[selected=true]:text-primary font-bold uppercase text-[10px] tracking-widest"
          }}
        >
          {state.tabs.map((tab) => (
            <Tab key={tab.id} title={tab.name} />
          ))}
        </Tabs>
        <Button isIconOnly size="sm" variant="light" className="ml-2" onPress={addTab}>+</Button>
      </div>

      <div className="flex flex-1 overflow-hidden p-6 gap-6">
        {/* Left Side: Cart */}
        <div className="flex-1 flex flex-col min-w-0">
          <KeyboardSearch 
            onSearch={handleProductSearch} 
            onSelect={handleProductSelect}
            isFocused={focusArea === "search"} 
          />
          <KeyboardCartTable 
            items={activeTab.items} 
            selectedIndex={selectedIndex}
            onUpdateQty={updateCartItem}
            onRemove={removeFromCart}
          />
        </div>

        {/* Right Side: Sidebar */}
        <div className="w-[450px] flex flex-col gap-6 overflow-y-auto no-scrollbar pb-6">
          <KeyboardCustomer 
            selectedCustomer={activeTab.customer}
            isFocused={focusArea === "customer"}
            onSelect={(c) => updateActiveTab({ customer: c, tempCustomer: undefined })}
            onTempChange={(name, mobile) => updateActiveTab({ tempCustomer: { name, mobile } })}
          />

          {/* Summary Card */}
          <Card shadow="sm" className="bg-primary-900/5 border-2 border-primary-500/20 shrink-0">
            <CardBody className="p-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-default-400">Order Summary</span>
              </div>
              
              <div className="flex flex-col gap-2 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-default-500 font-medium">Subtotal</span>
                  <span className="font-mono text-default-700">{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-default-500 font-medium">Tax</span>
                  <span className="font-mono text-default-700">{totalTax.toLocaleString()}</span>
                </div>
                <Divider className="my-2 opacity-50" />
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black uppercase text-primary">Grand Total</span>
                  <span className="text-5xl font-mono font-black tracking-tighter text-foreground">
                    ${grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <KeyboardPayment 
                payments={activeTab.payments}
                grandTotal={grandTotal}
                onUpdatePayment={updatePayment}
                onRemovePayment={removePayment}
                isFocused={focusArea === "payment"}
              />

              <Button 
                color={remaining <= 0 && activeTab.items.length > 0 ? "success" : "default"}
                size="lg"
                className="w-full mt-6 h-16 font-black text-xl uppercase tracking-widest shadow-lg"
                isDisabled={remaining > 0 || activeTab.items.length === 0}
              >
                {remaining > 0 ? "Pending Payment..." : "Complete Sale [ENTER]"}
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Footer Shortcut Bar */}
      <div className="h-10 bg-primary flex items-center px-6 gap-8 overflow-hidden shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
        {[
          { key: "F1", label: "Search" },
          { key: "F2", label: "Customer" },
          { key: "F4", label: "New Tab" },
          { key: "F8", label: "Payment" },
          { key: "ALT+1", label: "Add Cash" },
          { key: "ESC", label: "Focus Search" }
        ].map((s) => (
          <div key={s.key} className="flex items-center gap-2">
            <span className="bg-white/20 px-1.5 py-0.5 rounded font-black text-[11px] text-white border border-white/30">{s.key}</span>
            <span className="text-[11px] font-black uppercase tracking-wider text-white/90">{s.label}</span>
          </div>
        ))}
        <div className="ml-auto opacity-50 text-[10px] font-bold uppercase tracking-widest text-white">
          Arrows: Nav Cart | Del: Remove | Enter: Checkout
        </div>
      </div>
    </div>
  );
};
