"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Tabs,
  Tab,
  Button,
  Card,
  CardBody,
  Divider,
  Input,
  useDisclosure,
} from "@heroui/react";
import { ShortcutKey } from "@/components/ui/ShortcutKey";
import { X } from "lucide-react";
import clsx from "clsx";

import { KeyboardSearch } from "./KeyboardSearch";
import { KeyboardCartTable } from "./KeyboardCartTable";
import { KeyboardPayment } from "./KeyboardPayment";
import { KeyboardCustomer } from "./KeyboardCustomer";
import { PaymentMethodSelectorModal } from "./PaymentMethodSelectorModal";

import { PosPayment } from "@/lib/types/pos";
import { PosTab } from "@/lib/types/pos";
import { PaymentMethod, CashRegisterSession } from "@/lib/types/general";

interface KeyboardPOSProps {
  vendorId: string;
  activeSession: CashRegisterSession | null;
  handleCheckout: () => Promise<void>;
  isProcessing: boolean;
  paymentMethods: PaymentMethod[];
  subtotal: number;
  totalTax: number;
  itemsTotal: number;
  globalDiscount: number;
  grandTotal: number;
  totalApplied: number;
  totalChange: number;
  remaining: number;
  activeTab: any;
  addPayment: any;
  updatePayment: any;
  removePayment: any;
  updateActiveTab: any;
  addTab: any;
  closeTab: any;
  setActiveTab: any;
  state: any;
  addToCart: any;
  updateCartItem: any;
  removeFromCart: any;
  // Shared UI State
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  focusArea: "search" | "cart" | "payment" | "customer";
  setFocusArea: React.Dispatch<
    React.SetStateAction<"search" | "cart" | "payment" | "customer">
  >;
  searchFocusTrigger: number;
  setSearchFocusTrigger: React.Dispatch<React.SetStateAction<number>>;
  // Shared Handlers
  handleProductSearch: (query: string) => Promise<any[]>;
  handleProductSelect: (item: any, query: string) => Promise<void>;
  handleAddPaymentByType: (type: string) => void;
  // Selector State
  isSelectorOpen: boolean;
  onSelectorOpen: () => void;
  onSelectorOpenChange: (isOpen: boolean) => void;
  selectorMethods: PaymentMethod[];
  selectorTitle: string;
  currencySymbol: string;
  vatRate: number;
}

export const KeyboardPOS: React.FC<KeyboardPOSProps> = ({
  vendorId,
  activeSession,
  handleCheckout,
  isProcessing,
  paymentMethods,
  subtotal,
  totalTax,
  itemsTotal,
  globalDiscount,
  grandTotal,
  totalApplied,
  totalChange,
  remaining,
  activeTab,
  addPayment,
  updatePayment,
  removePayment,
  updateActiveTab,
  addTab,
  closeTab,
  setActiveTab,
  state,
  updateCartItem,
  removeFromCart,
  currencySymbol,
  vatRate,
  // Shared UI State
  selectedIndex,
  setSelectedIndex,
  focusArea,
  setFocusArea,
  searchFocusTrigger,
  setSearchFocusTrigger,
  // Shared Handlers
  handleProductSearch,
  handleProductSelect,
  handleAddPaymentByType,
  // Selector State
  isSelectorOpen,
  onSelectorOpenChange,
  selectorMethods,
  selectorTitle,
}) => {
  const stateRef = React.useRef<any>({});

  // Resizing State
  const [sidebarWidth, setSidebarWidth] = useState(480);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth >= 400 && newWidth <= 900) {
          setSidebarWidth(newWidth);
        }
      }
    },
    [isResizing],
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  useEffect(() => {
    // Prevent browser help menu on F1
    // window.onhelp = () => false;
  }, []);

  // Stable Listener Pattern: Use a ref to keep track of the latest state
  // This prevents the event listener from being removed and re-added on every state change.

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

        if (targetType) {
          handleAddPaymentByType(targetType);
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

  if (!activeTab) return null;

  const handleEsc = React.useCallback(() => {
    setFocusArea("search");
  }, [setFocusArea]);

  return (
    <div className={clsx(
      "flex flex-col min-h-[calc(100vh-64px)] bg-content1 text-foreground",
      isResizing && "select-none cursor-col-resize"
    )}>
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
          {state.tabs.map((tab: PosTab) => (
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
            currencySymbol={currencySymbol}
          />
        </div>

        {/* Resize Handle */}
        <div
          className={clsx(
            "w-1.5 relative z-50 group cursor-col-resize transition-colors duration-200",
            isResizing ? "bg-primary" : "bg-transparent hover:bg-primary/30"
          )}
          onMouseDown={startResizing}
        >
          <div className="absolute inset-y-0 -left-2 -right-2 bg-transparent" />
        </div>

        {/* Right Side: Sidebar */}
        <div 
          style={{ width: `${sidebarWidth}px`, minWidth: '400px' }}
          className="flex flex-col gap-4 overflow-y-auto no-scrollbar pb-6"
        >
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
          <Card
            className="bg-default-50/50 border-default-200 flex flex-col gap-0"
            shadow="none"
          >
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
                    {currencySymbol}{" "}
                    {subtotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-default-500">VAT ({vatRate || 0}%)</span>
                  <span className="font-mono font-bold tracking-tight">
                    {currencySymbol}{" "}
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
                        updateActiveTab({
                          discount_value: parseFloat(val) || 0,
                        })
                      }
                    />
                    <div className="flex bg-default-100 p-0.5 rounded-lg h-7">
                      <button
                        className={clsx(
                          "px-2 text-[10px] font-bold rounded-md transition-all",
                          activeTab.discount_type === "percentage"
                            ? "bg-content1 shadow-sm text-primary"
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
                            ? "bg-content1 shadow-sm text-primary"
                            : "text-default-400",
                        )}
                        onClick={() =>
                          updateActiveTab({ discount_type: "fixed" })
                        }
                      >
                        {currencySymbol}
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
                    {currencySymbol}{" "}
                    {grandTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm ">
                  <span className="text-default-500">Paid Amount</span>
                  <span className="font-mono font-bold text-success">
                    {currencySymbol}{" "}
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
                      {currencySymbol}{" "}
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
                  currencySymbol={currencySymbol}
                />

                <div
                  className={clsx(
                    "grid gap-2",
                    activeTab.payments.some((p: any) => p.isCash)
                      ? "grid-cols-3"
                      : "grid-cols-2",
                  )}
                >
                  {!activeTab.payments.some((p: PosPayment) => p.isCash) && (
                    <Button
                      className="font-bold text-[10px] uppercase h-8"
                      variant="flat"
                      onPress={() => handleAddPaymentByType("billing_counter")}
                    >
                      Cash <ShortcutKey>Alt+0</ShortcutKey>
                    </Button>
                  )}
                  <Button
                    className="font-bold text-[10px] uppercase h-8"
                    variant="flat"
                    onPress={() => handleAddPaymentByType("card")}
                  >
                    Card <ShortcutKey>Alt+1</ShortcutKey>
                  </Button>
                  <Button
                    className="font-bold text-[10px] uppercase h-8"
                    variant="flat"
                    onPress={() => handleAddPaymentByType("online")}
                  >
                    Online <ShortcutKey>Alt+2</ShortcutKey>
                  </Button>
                  <Button
                    className="font-bold text-[10px] uppercase h-8"
                    variant="flat"
                    onPress={() => handleAddPaymentByType("other")}
                  >
                    Others <ShortcutKey>Alt+3</ShortcutKey>
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {remaining > 0 ? (
            <div className="flex justify-between items-center w-full h-12 px-6 rounded-2xl bg-danger-500 text-white shadow-lg shadow-danger-500/30">
              <span className="text-sm font-black uppercase tracking-widest">
                Remaining to Pay
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-mono font-black">
                  {currencySymbol}{" "}
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
      <PaymentMethodSelectorModal
        isOpen={isSelectorOpen}
        onOpenChange={onSelectorOpenChange}
        methods={selectorMethods}
        title={selectorTitle}
        onSelect={(method: PaymentMethod) => {
          addPayment({
            methodId: method.id,
            methodName: method.name,
            isCash: method.type === "billing_counter",
            tenderedAmount: remaining > 0 ? remaining : 0,
            appliedAmount: remaining > 0 ? remaining : 0,
            changeAmount: 0,
          });
          setFocusArea("payment");
        }}
      />
    </div>
  );
};
