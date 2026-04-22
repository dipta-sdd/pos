"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { useDisclosure } from "@heroui/modal";
import { toast } from "sonner";

import RegisterStatusModal from "./_components/RegisterStatusModal";
import PosTouchScreen from "./_components/PosTouchScreen";
import PosKeyboard from "./_components/PosKeyboard";

import PermissionGuard from "@/components/auth/PermissionGuard";
import { useVendor } from "@/lib/contexts/VendorContext";
import { UserLoding } from "@/components/user-loding";
import api from "@/lib/api";
import {
  CashRegisterSession,
  Product,
  Variant,
  ProductStock,
} from "@/lib/types/general";
import { usePosState } from "@/lib/hooks/usePosState";

export default function PointOfSalePage() {
  const { vendor, isLoading: contextLoading } = useVendor();
  const [activeSession, setActiveSession] =
    useState<CashRegisterSession | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Custom hook for POS state
  const {
    state,
    activeTab,
    isInitialized,
    addTab,
    closeTab,
    setActiveTab,
    updateActiveTab,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  } = usePosState();

  const [focusItemId, setFocusItemId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [view, setView] = useState<"cart" | "payment">("cart");
  const [posMode, setPosMode] = useState<"touch" | "keyboard" | "mobile">("keyboard");

  const fetchActiveSession = async () => {
    if (!vendor?.id) return;
    try {
      const response: any = await api.get("/cash-register-sessions/active");

      setActiveSession(response.data);
    } catch (error) {
      console.error("Failed to fetch active session", error);
    } finally {
      setCheckingSession(false);
    }
  };

  useEffect(() => {
    fetchActiveSession();
  }, [vendor?.id]);

  useEffect(() => {
    if (!checkingSession && !activeSession) {
      onOpen();
    }
  }, [checkingSession, activeSession]);

  const handleProductSelect = (
    product: Product,
    variant: Variant,
    batch: ProductStock,
  ) => {
    addToCart(product, variant, batch, 1);
    setFocusItemId(variant.id.toString());
  };

  const handleCheckout = async () => {
    if (!activeSession || !vendor?.id) return;

    if (!activeTab.selectedPaymentMethodId) {
      toast.error("Please select a payment method");
      setView("payment");
      return;
    }

    const total = activeTab.items.reduce((sum, i) => sum + i.total, 0);

    if (activeTab.receivedAmount < total) {
      toast.error("Received amount is less than total");
      return;
    }

    setIsProcessing(true);
    try {
      const payload = {
        vendor_id: vendor.id,
        branch_id:
          activeSession.billing_counter?.branch_id || vendor.branches?.[0]?.id,
        sales_person_id: activeSession.user_id,
        cash_register_session_id: activeSession.id,
        customer_id: activeTab.customer?.id || null,
        subtotal_amount: activeTab.items.reduce(
          (sum, i) => sum + i.subtotal,
          0,
        ),
        total_discount_amount: activeTab.items.reduce(
          (sum, i) => sum + i.discount,
          0,
        ),
        tax_amount: activeTab.items.reduce((sum, i) => sum + i.tax_amount, 0),
        final_amount: total,
        status: "completed",
        items: activeTab.items.map((item) => ({
          variant_id: item.variant.id,
          product_stock_id: item.batch.id,
          quantity: item.quantity,
          sell_price_at_sale: item.price,
          discount_amount: item.discount,
          tax_amount: item.tax_amount,
          tax_rate_applied: item.tax_rate,
          line_total: item.total,
        })),
        payments: [
          {
            payment_method_id: activeTab.selectedPaymentMethodId,
            amount: total,
          },
        ],
      };

      await api.post("/sales", payload);
      toast.success("Sale completed successfully!");
      clearCart();
      setView("cart");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to process sale");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        if (view === "cart") setView("payment");
        else handleCheckout();
      }
      if (e.key === "F4") {
        e.preventDefault();
        setView("cart");
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [view, activeTab, handleCheckout]);

  if (contextLoading || checkingSession || !isInitialized)
    return <UserLoding />;

  const posProps = {
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
  };

  return (
    <PermissionGuard permission="can_use_pos">
      {posMode === "touch" && <PosTouchScreen {...posProps} />}
      {posMode === "keyboard" && <PosKeyboard {...posProps} />}
      
      <RegisterStatusModal
        activeSession={activeSession}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onSessionChange={fetchActiveSession}
      />
    </PermissionGuard>
  );
}
