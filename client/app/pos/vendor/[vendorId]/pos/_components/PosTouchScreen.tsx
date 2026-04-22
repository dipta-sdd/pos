"use client";

import { Card, CardBody, Button } from "@heroui/react";
import { AlertCircle, LayoutPanelTop } from "lucide-react";

import TabSection from "./TabSection";
import ProductSelection from "./ProductSelection";
import CartSection from "./CartSection";
import PaymentSection from "./PaymentSection";

import {
  CashRegisterSession,
  Product,
  Variant,
  ProductStock,
} from "@/lib/types/general";
import { PosTab, CartItem, PosState, PosPayment } from "@/lib/types/pos";

interface PosTouchScreenProps {
  state: PosState;
  activeTab: PosTab;
  activeSession: CashRegisterSession | null;
  isProcessing: boolean;
  view: "cart" | "payment";
  setView: (view: "cart" | "payment") => void;
  onOpen: () => void;
  focusItemId: string | null;
  setFocusItemId: (id: string | null) => void;
  // Handlers
  addTab: () => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateActiveTab: (updates: Partial<PosTab>) => void;
  addToCart: (
    product: Product,
    variant: Variant,
    batch: ProductStock,
    quantity: number,
  ) => void;
  updateCartItem: (itemId: string, updates: Partial<CartItem>) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  handleCheckout: () => Promise<void>;
  handleProductSelect: (
    product: Product,
    variant: Variant,
    batch: ProductStock,
  ) => void;
  // Payment helpers
  addPayment: (payment: Omit<PosPayment, "id">) => void;
  updatePayment: (id: string, updates: Partial<PosPayment>) => void;
  removePayment: (id: string) => void;
}

export default function PosTouchScreen({
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
  addPayment,
  updatePayment,
  removePayment,
}: PosTouchScreenProps) {
  // Legacy bridging for Touch screen (uses first payment as primary)
  const firstPayment = activeTab.payments[0];
  const selectedMethodId = firstPayment?.methodId || null;
  const receivedAmount = firstPayment?.tenderedAmount || 0;
  const totalAmount = activeTab.items.reduce((sum, i) => sum + i.total, 0);

  const handleLegacyMethodSelect = (id: number, name: string) => {
    const isCash = name.toLowerCase().includes("cash");

    if (activeTab.payments.length > 0) {
      updatePayment(activeTab.payments[0].id, {
        methodId: id,
        methodName: name,
        isCash,
        appliedAmount: totalAmount,
        tenderedAmount: totalAmount,
      });
    } else {
      addPayment({
        methodId: id,
        methodName: name,
        isCash,
        appliedAmount: totalAmount,
        tenderedAmount: totalAmount,
        changeAmount: 0,
      });
    }
  };

  const handleLegacyAmountChange = (amt: number) => {
    if (activeTab.payments.length > 0) {
      const p = activeTab.payments[0];
      const applied = p.isCash ? Math.min(amt, totalAmount) : amt;

      updatePayment(p.id, {
        tenderedAmount: amt,
        appliedAmount: applied,
        changeAmount: p.isCash ? Math.max(0, amt - applied) : 0,
      });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Header with Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-default-100 flex flex-col md:flex-row justify-between items-center px-4 pt-2">
        <TabSection
          activeTabId={state.activeTabId}
          tabs={state.tabs}
          onTabAdd={addTab}
          onTabClose={closeTab}
          onTabSelect={setActiveTab}
        />

        <div className="flex items-center gap-3 pb-2 md:pb-0">
          <div className="flex items-center gap-2 px-3 py-1 bg-default-100 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <div
              className={`w-2 h-2 rounded-full ${activeSession ? "bg-success" : "bg-danger animate-pulse"}`}
            />
            {activeSession
              ? `Register: ${activeSession.billing_counter?.name}`
              : "Register Closed"}
          </div>
          <Button
            color={activeSession ? "default" : "primary"}
            size="sm"
            startContent={<LayoutPanelTop className="w-4 h-4" />}
            variant="flat"
            onPress={onOpen}
          >
            {activeSession ? "Manager" : "Open"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative">
        {/* Locked State Overlay */}
        {!activeSession && (
          <div className="absolute inset-0 z-50 bg-white/60 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <Card className="max-w-md w-full mx-4 shadow-2xl border-none">
              <CardBody className="p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Register is Closed
                  </h2>
                  <p className="text-default-500">
                    You must open a cash register session before you can process
                    any sales.
                  </p>
                </div>
                <Button
                  className="w-full font-bold h-12"
                  color="primary"
                  size="lg"
                  onPress={onOpen}
                >
                  Open Register Now
                </Button>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Left Side: Product Selection (40%) */}
        <div className="w-full lg:w-[450px] flex flex-col p-4 overflow-hidden border-r border-default-100 bg-gray-50 dark:bg-gray-900/40">
          <ProductSelection onSelect={handleProductSelect} />
        </div>

        {/* Right Side: Cart & Payment (60%) */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
          <div className="flex border-b border-default-100">
            <button
              className={`px-8 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${view === "cart" ? "border-primary text-primary" : "border-transparent text-default-400 hover:text-default-600"}`}
              onClick={() => setView("cart")}
            >
              Cart Table
            </button>
            <button
              className={`px-8 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${view === "payment" ? "border-primary text-primary" : "border-transparent text-default-400 hover:text-default-600"}`}
              onClick={() => setView("payment")}
            >
              Checkout Details
            </button>
          </div>

          <div className="flex-1 overflow-hidden relative">
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
              <div className="h-full flex flex-col bg-white dark:bg-gray-800 p-8 overflow-y-auto">
                <div className="max-w-2xl mx-auto w-full">
                  <h2 className="text-3xl font-black mb-8 tracking-tighter">
                    Finalize Payment
                  </h2>
                  <PaymentSection
                    receivedAmount={receivedAmount}
                    selectedMethodId={selectedMethodId}
                    total={totalAmount}
                    onAmountChange={handleLegacyAmountChange}
                    onMethodSelect={handleLegacyMethodSelect}
                  />

                  <div className="mt-12 pt-8 border-t border-default-100 flex gap-4">
                    <Button
                      className="flex-1 h-20 text-2xl font-black shadow-2xl shadow-primary/30"
                      color="primary"
                      isLoading={isProcessing}
                      size="lg"
                      onPress={handleCheckout}
                    >
                      COMPLETE TRANSACTION
                    </Button>
                    <Button
                      className="h-20 px-8"
                      variant="flat"
                      onPress={() => setView("cart")}
                    >
                      Back
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
