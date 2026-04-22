"use client";

import React, { useState, useEffect } from "react";
import { Tabs, Tab, Button, Card, CardBody, Divider } from "@heroui/react";
import { toast } from "sonner";
import { ShortcutKey } from "@/components/ui/ShortcutKey";
import { X } from "lucide-react";

import { KeyboardSearch } from "./KeyboardSearch";
import { KeyboardCartTable } from "./KeyboardCartTable";
import { KeyboardPayment } from "./KeyboardPayment";
import { KeyboardCustomer } from "./KeyboardCustomer";

import { usePosState } from "@/lib/hooks/usePosState";
import api from "@/lib/api";
import { PaymentMethod, CashRegisterSession } from "@/lib/types/general";

interface KeyboardPOSProps {
  vendorId: string;
  activeSession: CashRegisterSession | null;
}

export const KeyboardPOS: React.FC<KeyboardPOSProps> = ({ vendorId, activeSession }) => {
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
    closeTab,
    setActiveTab,
    updateActiveTab,
  } = usePosState();

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [focusArea, setFocusArea] = useState<
    "search" | "cart" | "payment" | "customer"
  >("search");
  const [searchFocusTrigger, setSearchFocusTrigger] = useState(0);

  // Derived state
  const subtotal = activeTab
    ? (activeTab.items || []).reduce((sum, item) => sum + item.subtotal, 0)
    : 0;
  const totalTax = activeTab
    ? (activeTab.items || []).reduce((sum, item) => sum + item.tax_amount, 0)
    : 0;
  const grandTotal = activeTab
    ? (activeTab.items || []).reduce((sum, item) => sum + item.total, 0)
    : 0;
  const totalApplied = activeTab
    ? (activeTab.payments || []).reduce((sum, p) => sum + p.appliedAmount, 0)
    : 0;
  const remaining = grandTotal - totalApplied;
  console.log(focusArea);
  useEffect(() => {
    // Prevent browser help menu on F1
    window.onhelp = () => false;

    const fetchMethods = async () => {
      if (!activeSession) return;
      try {
        const res: any = await api.get(
          `/pos/payment-methods?vendor_id=${vendorId}&branch_id=${activeSession.billing_counter?.branch_id}&billing_counter_id=${activeSession.billing_counter_id}`,
        );

        setPaymentMethods(res.data.data || []);
      } catch (err) {
        toast.error("Failed to load payment methods");
      }
    };

    fetchMethods();
  }, [vendorId, activeSession]);

  // Stable Listener Pattern: Use a ref to keep track of the latest state
  // This prevents the event listener from being removed and re-added on every state change.
  const stateRef = React.useRef({
    focusArea,
    activeTab,
    paymentMethods,
    remaining,
    selectedIndex,
    addTab,
    addPayment,
    removeFromCart,
  });

  stateRef.current = {
    focusArea,
    activeTab,
    paymentMethods,
    remaining,
    selectedIndex,
    addTab,
    addPayment,
    removeFromCart,
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const {
        focusArea: curFocusArea,
        activeTab: curActiveTab,
        paymentMethods: curPaymentMethods,
        remaining: curRemaining,
        selectedIndex: curSelectedIndex,
        addTab: doAddTab,
        addPayment: doAddPayment,
        removeFromCart: doRemoveFromCart,
      } = stateRef.current;
      console.log(e.key);
      if (e.key === "F1") {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        setFocusArea("search");
        setSearchFocusTrigger((prev) => prev + 1);
      }
      if (e.key === "F2") {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        setFocusArea("customer");
      }
      if (e.key === "F3") {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        setFocusArea("cart");
      }
      if (e.key === "F4") {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        doAddTab();
      }
      if (e.key === "F8") {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        setFocusArea("payment");
      }

      if (e.altKey && !isNaN(parseInt(e.key))) {
        e.preventDefault();
        const num = parseInt(e.key);
        const method = curPaymentMethods[num - 1];

        if (method && curActiveTab) {
          const isCash = method.type === 'billing_counter' || method.name.toLowerCase().includes("cash");

          doAddPayment({
            methodId: method.id,
            methodName: method.name,
            isCash,
            tenderedAmount: curRemaining > 0 ? curRemaining : 0,
            appliedAmount: curRemaining > 0 ? curRemaining : 0,
            changeAmount: 0,
          });
          setFocusArea("payment");
        }
      }

      if (curFocusArea === "cart" && curActiveTab) {
        if (e.key === "ArrowDown")
          setSelectedIndex((prev) =>
            Math.min(prev + 1, curActiveTab.items.length - 1),
          );
        if (e.key === "ArrowUp")
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
        if (e.key === "Delete" && curActiveTab.items[curSelectedIndex])
          doRemoveFromCart(curActiveTab.items[curSelectedIndex].id);
      }

      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        setFocusArea("search");
        setSearchFocusTrigger((prev) => prev + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);

    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, []);

  const handleEsc = React.useCallback(() => {
    setFocusArea("search");
  }, []);

  if (!activeTab) return null;

  const handleProductSearch = async (query: string): Promise<any[]> => {
    if (!query) return [];
    try {
      const res: any = await api.get(`/branch-products?search=${query}`);

      return res.data.data || (Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      return [];
    }
  };

  const handleProductSelect = async (item: any, query: string) => {
    try {
      const batchRes: any = await api.get(
        `/branch-products/stocks?variant_id=${item.id}`,
      );
      const batches = batchRes.data || [];

      if (batches.length > 0) {
        const productObj: any = {
          id: item.product_id,
          name: item.product_name,
          image_url: item.image_url,
        };
        const variantObj: any = {
          id: item.id,
          name: item.variant_name,
          value: item.variant_value,
          sku: item.sku,
          barcode: item.barcode,
        };

        const addedId = addToCart(productObj, variantObj, batches[0], 1);

        // Barcode detection: if it matches query exactly, keep focus on search
        const isBarcode =
          String(item.barcode).toLowerCase() === query.toLowerCase();

        console.log(
          `[${new Date().toISOString()}] POS: Product Selected. ID: ${addedId}, isBarcode: ${isBarcode}`,
        );

        if (isBarcode) {
          setFocusArea("search");
          toast.success(`Added ${item.product_name}`);
        } else {
          setFocusArea("cart");
          toast.success(`Added ${item.product_name} - Item in Cart`);
        }
      } else {
        toast.error("No stock available");
      }
    } catch (err) {
      toast.error("Failed to add product");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-content1 text-foreground overflow-hidden">
      {/* Sale Tabs */}
      <div className="flex items-center px-4 pt-2 bg-default-50 border-b border-default-200">
        <Tabs
          aria-label="POS Tabs"
          classNames={{
            tabList: "gap-6 h-10",
            cursor: "w-full bg-primary rounded-b-none",
            tab: "px-0 h-10 ",
            tabContent:
              "group-data-[selected=true]:text-primary font-bold uppercase text-[10px] tracking-widest",
          }}
          color="primary"
          selectedKey={activeTab.id}
          variant="light"
          onSelectionChange={(key) => setActiveTab(key as string)}
        >
          {state.tabs.map((tab) => (
            <Tab
              key={tab.id}
              title={
                <div
                  className={`flex items-center gap-2 ${activeTab.id === tab.id ? "text-white px-2" : ""}`}
                >
                  <span>{tab.name}</span>
                  {state.tabs.length > 1 && (
                    <span
                      role="button"
                      tabIndex={0}
                      className="hover:text-danger-500 transition-colors p-0.5 rounded-full hover:bg-default-100 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(tab.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          closeTab(tab.id);
                        }
                      }}
                    >
                      <X size={12} />
                    </span>
                  )}
                </div>
              }
            />
          ))}
        </Tabs>
        <Button
          isIconOnly
          className="ml-2"
          size="sm"
          variant="light"
          onPress={addTab}
        >
          +
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden p-6 gap-6">
        {/* Left Side: Cart */}
        <div className="flex-1 flex flex-col min-w-0">
          <KeyboardSearch
            isFocused={focusArea === "search"}
            focusTrigger={searchFocusTrigger}
            onSearch={handleProductSearch}
            onSelect={handleProductSelect}
          />
          <KeyboardCartTable
            focusArea={focusArea}
            items={activeTab.items}
            selectedIndex={selectedIndex}
            onEsc={handleEsc}
            onRemove={removeFromCart}
            onUpdateQty={updateCartItem}
          />
        </div>

        {/* Right Side: Sidebar */}
        <div className="w-[450px] flex flex-col gap-6 overflow-y-auto no-scrollbar pb-6">
          <KeyboardCustomer
            isFocused={focusArea === "customer"}
            selectedCustomer={activeTab.customer}
            onSelect={(c) =>
              updateActiveTab({ customer: c, tempCustomer: undefined })
            }
            onTempChange={(name, mobile) =>
              updateActiveTab({ tempCustomer: { name, mobile } })
            }
          />

          {/* Summary Card */}
          <Card
            className="bg-primary-900/5 border-2 border-primary-500/20 shrink-0"
            shadow="sm"
          >
            <CardBody className="p-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-default-400">
                  Order Summary
                </span>
              </div>

              <div className="flex flex-col gap-2 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-default-500 font-medium">Subtotal</span>
                  <span className="font-mono text-default-700">
                    {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-default-500 font-medium">Tax</span>
                  <span className="font-mono text-default-700">
                    {totalTax.toLocaleString()}
                  </span>
                </div>
                <Divider className="my-2 opacity-50" />
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black uppercase text-primary">
                    Grand Total
                  </span>
                  <span className="text-5xl font-mono font-black tracking-tighter text-foreground">
                    ${grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <KeyboardPayment
                grandTotal={grandTotal}
                isFocused={focusArea === "payment"}
                payments={activeTab.payments}
                onRemovePayment={removePayment}
                onUpdatePayment={updatePayment}
              />

              <Button
                className="w-full mt-6 h-16 font-black text-xl uppercase tracking-widest shadow-lg"
                color={
                  remaining <= 0 && activeTab.items.length > 0
                    ? "success"
                    : "default"
                }
                isDisabled={remaining > 0 || activeTab.items.length === 0}
                size="lg"
              >
                {remaining > 0 ? (
                  "Pending Payment..."
                ) : (
                  <span>
                    Complete Sale <ShortcutKey>ENTER</ShortcutKey>
                  </span>
                )}
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
          { key: "F3", label: "Cart" },
          { key: "F4", label: "New Tab" },
          { key: "F8", label: "Payment" },
          { key: "ALT+1", label: "Add Cash" },
          { key: "ESC", label: "Focus Search" },
        ].map((s) => (
          <div key={s.key} className="flex items-center gap-2">
            <ShortcutKey>{s.key}</ShortcutKey>
            <span className="text-[11px] font-black uppercase tracking-wider text-white/90">
              {s.label}
            </span>
          </div>
        ))}
        <div className="ml-auto opacity-50 text-[10px] font-bold uppercase tracking-widest text-white">
          Arrows: Nav Cart | Del: <ShortcutKey>DELETE</ShortcutKey> | Enter:{" "}
          <ShortcutKey>ENTER</ShortcutKey>
        </div>
      </div>
    </div>
  );
};
