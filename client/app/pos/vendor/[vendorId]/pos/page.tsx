"use client";

import { useEffect, useState, useCallback } from "react";
import { useDisclosure } from "@heroui/modal";
import { toast } from "sonner";
import { useParams } from "next/navigation";

import RegisterStatusModal from "./_components/RegisterStatusModal";
import PosTouchScreen from "./_components/PosTouchScreen";
import { KeyboardPOS } from "./_components/keyboard/KeyboardPOS";

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
  const params = useParams();
  const vendorId = params.vendorId as string;

  const [activeSession, setActiveSession] =
    useState<CashRegisterSession | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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
    updatePayment,
    addPayment,
    removePayment,
  } = usePosState();

  const [focusItemId, setFocusItemId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [view, setView] = useState<"cart" | "payment">("cart");
  const [posMode, setPosMode] = useState<"touch" | "keyboard" | "mobile">(
    "keyboard",
  );

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

  const handleCheckout = useCallback(async () => {
    if (!activeSession || !vendor?.id) return;

    if ((activeTab.payments || []).length === 0) {
      toast.error("Please add at least one payment method");

      return;
    }

    const total = (activeTab.items || []).reduce((sum, i) => sum + i.total, 0);
    const totalApplied = (activeTab.payments || []).reduce(
      (sum, p) => sum + p.appliedAmount,
      0,
    );

    if (totalApplied < total) {
      toast.error("Applied payment amount is less than total");

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
        tempCustomer: activeTab.tempCustomer,
        subtotal_amount: (activeTab.items || []).reduce(
          (sum, i) => sum + i.subtotal,
          0,
        ),
        total_discount_amount: (activeTab.items || []).reduce(
          (sum, i) => sum + i.discount,
          0,
        ),
        tax_amount: (activeTab.items || []).reduce((sum, i) => sum + i.tax_amount, 0),
        final_amount: total,
        status: "completed",
        items: (activeTab.items || []).map((item) => ({
          variant_id: item.variant.id,
          product_stock_id: item.batch.id,
          quantity: item.quantity,
          sell_price_at_sale: item.price,
          discount_amount: item.discount,
          tax_amount: item.tax_amount,
          tax_rate_applied: item.tax_rate,
          line_total: item.total,
        })),
        payments: (activeTab.payments || []).map((p) => ({
          payment_method_id: p.methodId,
          amount: p.appliedAmount,
        })),
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
  }, [activeSession, vendor, activeTab, clearCart]);

  // Global Checkout Shortcut (Enter when everything is ready)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !isProcessing) {
        const total = (activeTab.items || []).reduce((sum, i) => sum + i.total, 0);
        const totalApplied = (activeTab.payments || []).reduce(
          (sum, p) => sum + p.appliedAmount,
          0,
        );

        // Only trigger if focus is not in an input (unless it's the main checkout flow)
        if (
          total > 0 &&
          totalApplied >= total &&
          document.activeElement?.tagName !== "INPUT"
        ) {
          handleCheckout();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);

    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [activeTab, isProcessing, handleCheckout]);

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
    // Multi-payment helpers for touch/mobile
    updatePayment,
    addPayment,
    removePayment,
  };

  return (
    <PermissionGuard permission="can_use_pos">
      {posMode === "keyboard" ? (
        <KeyboardPOS activeSession={activeSession} vendorId={vendorId} />
      ) : (
        <PosTouchScreen {...posProps} />
      )}

      <RegisterStatusModal
        activeSession={activeSession}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onSessionChange={fetchActiveSession}
      />
    </PermissionGuard>
  );
}
