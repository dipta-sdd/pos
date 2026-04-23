"use client";

import React, { useState, useEffect } from "react";
import {
  Tabs,
  Tab,
  Button,
  Card,
  CardBody,
  Divider,
  Input,
} from "@heroui/react";
import { toast } from "sonner";
import { ShortcutKey } from "@/components/ui/ShortcutKey";
import { X } from "lucide-react";
import clsx from "clsx";

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
  handleCheckout: () => Promise<void>;
  isProcessing: boolean;
}

export const KeyboardPOS: React.FC<KeyboardPOSProps> = ({
  vendorId,
  activeSession,
  handleCheckout,
  isProcessing,
}) => {
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

  const itemsTotal = activeTab
    ? (activeTab.items || []).reduce((sum, item) => sum + item.total, 0)
    : 0;

  const globalDiscount = activeTab
    ? activeTab.discount_type === "percentage"
      ? (subtotal * activeTab.discount_value) / 100
      : activeTab.discount_value
    : 0;

  const grandTotal =
    itemsTotal - globalDiscount + (activeTab?.extra_charge || 0);

  const totalApplied = activeTab
    ? (activeTab.payments || []).reduce((sum, p) => sum + p.appliedAmount, 0)
    : 0;

  const totalChange = activeTab
    ? (activeTab.payments || []).reduce((sum, p) => sum + p.changeAmount, 0)
    : 0;
  const remaining = grandTotal - totalApplied;
  console.log(focusArea);
  useEffect(() => {
    // Prevent browser help menu on F1
    window.onhelp = () => false;

    const fetchMethods = async () => {
      console.log("KeyboardPOS: fetchMethods", { activeSession });
      if (!activeSession) return;
      try {
        const res: any = await api.get(
          `/pos/payment-methods?vendor_id=${vendorId}&branch_id=${activeSession.billing_counter?.branch_id}&billing_counter_id=${activeSession.billing_counter_id}`,
        );
        console.log("KeyboardPOS: Payment methods loaded", res.data.data);
        setPaymentMethods(res.data.data || []);
      } catch (err) {
        toast.error("Failed to load payment methods");
      }
    };

    fetchMethods();
  }, [vendorId, activeSession]);

  // Auto-select Cash & Update Payment Amount
  useEffect(() => {
    if (!activeTab || paymentMethods.length === 0) return;

    const cashMethod = paymentMethods.find(
      (pm) => pm.type === "billing_counter",
    );
    if (!cashMethod) return;

    const existingPayments = activeTab.payments || [];
    const cashPayment = existingPayments.find(
      (p) => p.methodId === cashMethod.id,
    );

    if (existingPayments.length === 0) {
      // Auto-add cash payment if none exist (start at 0 for manual entry)
      addPayment({
        methodId: cashMethod.id,
        methodName: cashMethod.name,
        isCash: true,
        tenderedAmount: 0,
        appliedAmount: 0,
        changeAmount: 0,
      });
    }
  }, [grandTotal, activeTab?.id, paymentMethods]);

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
        
        // Mapping: Alt+0 -> Cash, Alt+1 -> Card, Alt+2 -> Online, Alt+3 -> Other
        const typeMap: Record<number, string> = {
          0: "billing_counter",
          1: "card",
          2: "online",
          3: "other",
        };
        const targetType = typeMap[num];

        if (targetType && curActiveTab) {
          // Find the first method of this type that isn't already added
          const method = curPaymentMethods.find(
            (pm) => pm.type === targetType && !(curActiveTab.payments || []).some(p => p.methodId === pm.id)
          );

          if (method) {
            doAddPayment({
              methodId: method.id,
              methodName: method.name,
              isCash: targetType === "billing_counter",
              tenderedAmount: curRemaining > 0 ? curRemaining : 0,
              appliedAmount: curRemaining > 0 ? curRemaining : 0,
              changeAmount: 0,
            });
            setFocusArea("payment");
          } else {
            const hasAny = curPaymentMethods.some(pm => pm.type === targetType);
            if (!hasAny) {
              toast.error(`No ${targetType} payment method configured`);
            } else {
              toast.error(`All available ${targetType} methods are already added`);
            }
          }
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
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-content1 text-foreground">
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

      <div className="flex flex-1 p-6 gap-6">
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
        <div className="w-[480px] flex flex-col gap-4 overflow-y-auto no-scrollbar pb-6">
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
          {/* 🧾 ORDER SUMMARY */}
          {/* COMBINED BILLING CARD */}
          <Card className="bg-default-50/50 border-default-200 flex flex-col gap-0" shadow="none">
            <CardBody className="p-0 gap-0">
              {/* 🧾 ORDER SUMMARY */}
              <div className="p-4 gap-3 flex flex-col border-b border-default-200">
                <div className="flex justify-between items-center pb-2 border-b border-default-100">
                  <span className="text-[10px] font-black uppercase tracking-widest text-default-400">
                    🧾 Order Summary
                  </span>
                  <div className="bg-primary-100 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {activeTab.items.length} Items
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-default-500">Subtotal</span>
                  <span className="font-mono font-bold tracking-tight">
                    ৳{" "}
                    {subtotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-default-500">VAT (5%)</span>
                  <span className="font-mono font-bold tracking-tight">
                    ৳{" "}
                    {totalTax.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                {/* Discount Row */}
                <div className="flex items-center justify-between gap-4 pt-1">
                  <span className="text-xs font-bold text-default-600">
                    Discount
                  </span>
                  <div className="flex gap-2 items-center">
                    <Input
                      className="w-24 font-mono"
                      placeholder="0.00"
                      size="sm"
                      type="number"
                      variant="bordered"
                      value={activeTab.discount_value.toString()}
                      onValueChange={(val) =>
                        updateActiveTab({ discount_value: parseFloat(val) || 0 })
                      }
                    />
                    <div className="flex bg-default-100 p-0.5 rounded-lg h-7">
                      <button
                        className={clsx(
                          "px-2 text-[10px] font-bold rounded-md transition-all",
                          activeTab.discount_type === "percentage"
                            ? "bg-white shadow-sm text-primary"
                            : "text-default-400",
                        )}
                        onClick={() =>
                          updateActiveTab({ discount_type: "percentage" })
                        }
                      >
                        %
                      </button>
                      <button
                        className={clsx(
                          "px-2 text-[10px] font-bold rounded-md transition-all",
                          activeTab.discount_type === "fixed"
                            ? "bg-white shadow-sm text-primary"
                            : "text-default-400",
                        )}
                        onClick={() =>
                          updateActiveTab({ discount_type: "fixed" })
                        }
                      >
                        ৳
                      </button>
                    </div>
                  </div>
                </div>

                {/* Coupon Row */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-bold text-default-600">
                    Coupon
                  </span>
                  <div className="flex gap-2 items-center">
                    <Input
                      className="w-32"
                      placeholder="CODE"
                      size="sm"
                      variant="bordered"
                      value={activeTab.coupon_code}
                      onValueChange={(val) =>
                        updateActiveTab({ coupon_code: val })
                      }
                    />
                    <Button
                      className="h-7 min-w-0 px-3 font-bold text-[10px]"
                      color="primary"
                      size="sm"
                      variant="flat"
                    >
                      APPLY
                    </Button>
                  </div>
                </div>

                {/* Extra Charge Row */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-bold text-default-600">
                    Extra
                  </span>
                  <Input
                    className="w-24 font-mono"
                    placeholder="0.00"
                    size="sm"
                    type="number"
                    variant="bordered"
                    value={activeTab.extra_charge.toString()}
                    onValueChange={(val) =>
                      updateActiveTab({ extra_charge: parseFloat(val) || 0 })
                    }
                  />
                </div>
              </div>

              {/* 💳 PAYMENTS */}
              <div className="p-3 gap-2 flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-default-400">
                  💳 Payments
                </span>

                <div className="flex justify-between items-center py-1">
                  <span className="text-xs font-black uppercase text-primary">
                    Grand Total
                  </span>
                  <span className="text-2xl font-mono font-black tracking-tighter">
                    ৳{" "}
                    {grandTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm ">
                  <span className="text-default-500">Paid Amount</span>
                  <span className="font-mono font-bold text-success">
                    ৳{" "}
                    {totalApplied.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                {totalChange > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-default-500 font-bold uppercase text-[10px]">
                      Change
                    </span>
                    <span className="font-mono font-bold text-success">
                      ৳{" "}
                      {totalChange.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}

                <KeyboardPayment
                  grandTotal={grandTotal}
                  isFocused={focusArea === "payment"}
                  payments={activeTab.payments}
                  onRemovePayment={removePayment}
                  onUpdatePayment={updatePayment}
                />

                <div
                  className={clsx(
                    "grid gap-2",
                    activeTab.payments.some((p) => p.isCash)
                      ? "grid-cols-3"
                      : "grid-cols-2",
                  )}
                >
                  {!activeTab.payments.some((p) => p.isCash) && (
                    <Button
                      className="font-bold text-[10px] uppercase h-8"
                      variant="flat"
                      onPress={() => {
                        const method = paymentMethods.find(
                          (m) => m.type === "billing_counter" && !activeTab.payments.some(p => p.methodId === m.id),
                        );
                        if (method) {
                          addPayment({
                            methodId: method.id,
                            methodName: method.name,
                            isCash: true,
                            tenderedAmount: 0,
                            appliedAmount: 0,
                            changeAmount: 0,
                          });
                        }
                      }}
                    >
                      Cash <ShortcutKey>Alt+0</ShortcutKey>
                    </Button>
                  )}
                  <Button
                    className="font-bold text-[10px] uppercase h-8"
                    variant="flat"
                    onPress={() => {
                      const method = paymentMethods.find(
                        (m) => m.type === "card" && !activeTab.payments.some(p => p.methodId === m.id),
                      );
                      if (method) {
                        addPayment({
                          methodId: method.id,
                          methodName: method.name,
                          isCash: false,
                          tenderedAmount: remaining > 0 ? remaining : 0,
                          appliedAmount: remaining > 0 ? remaining : 0,
                          changeAmount: 0,
                        });
                      } else {
                        toast.error("No more card methods available");
                      }
                    }}
                  >
                    Card <ShortcutKey>Alt+1</ShortcutKey>
                  </Button>
                  <Button
                    className="font-bold text-[10px] uppercase h-8"
                    variant="flat"
                    onPress={() => {
                      const method = paymentMethods.find(
                        (m) => m.type === "online" && !activeTab.payments.some(p => p.methodId === m.id),
                      );
                      if (method) {
                        addPayment({
                          methodId: method.id,
                          methodName: method.name,
                          isCash: false,
                          tenderedAmount: remaining > 0 ? remaining : 0,
                          appliedAmount: remaining > 0 ? remaining : 0,
                          changeAmount: 0,
                        });
                      } else {
                        toast.error("No more online methods available");
                      }
                    }}
                  >
                    Online <ShortcutKey>Alt+2</ShortcutKey>
                  </Button>
                  <Button
                    className="font-bold text-[10px] uppercase h-8"
                    variant="flat"
                    onPress={() => {
                      const method = paymentMethods.find(
                        (m) => m.type === "other" && !activeTab.payments.some(p => p.methodId === m.id),
                      );
                      if (method) {
                        addPayment({
                          methodId: method.id,
                          methodName: method.name,
                          isCash: false,
                          tenderedAmount: remaining > 0 ? remaining : 0,
                          appliedAmount: remaining > 0 ? remaining : 0,
                          changeAmount: 0,
                        });
                      } else {
                        toast.error("No more other methods available");
                      }
                    }}
                  >
                    Others <ShortcutKey>Alt+3</ShortcutKey>
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {remaining > 0 ? (
            <div className="flex justify-between items-center w-full h-12 px-6 rounded-2xl bg-danger-500 text-white shadow-lg shadow-danger-500/30">
              <span className="text-sm font-black uppercase tracking-widest">Remaining to Pay</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-mono font-black">
                  ৳{" "}
                  {remaining.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
                <span className="animate-pulse text-lg">⚠️</span>
              </div>
            </div>
          ) : (
            <Button
              className="w-full h-12 font-black text-lg uppercase tracking-widest shadow-xl rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
              color={activeTab.items.length > 0 ? "success" : "default"}
              isDisabled={activeTab.items.length === 0 || isProcessing}
              size="lg"
              onPress={handleCheckout}
            >
              {isProcessing ? (
                "Processing..."
              ) : (
                <div className="flex flex-col items-center">
                  <span>Complete Sale</span>
                  <span className="text-[10px] font-bold opacity-60">
                    Press [ENTER]
                  </span>
                </div>
              )}
            </Button>
          )}
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
          { key: "Alt+1", label: "Card" },
          { key: "Alt+2", label: "Online" },
          { key: "Alt+3", label: "Others" },
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
