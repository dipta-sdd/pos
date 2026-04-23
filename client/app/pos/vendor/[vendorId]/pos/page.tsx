"use client";

import { useEffect, useState, useCallback } from "react";
import { useDisclosure } from "@heroui/modal";
import { Button } from "@heroui/react";
import { toast } from "sonner";
import { useParams } from "next/navigation";

import RegisterStatusModal from "./_components/RegisterStatusModal";
import PosTouchScreen from "./_components/PosTouchScreen";
import { KeyboardPOS } from "./_components/keyboard/KeyboardPOS";

import PermissionGuard from "@/components/auth/PermissionGuard";
import { useVendor } from "@/lib/contexts/VendorContext";
import { UserLoding } from "@/components/user-loding";
import api from "@/lib/api";
import { CashRegisterSession, PaymentMethod } from "@/lib/types/general";
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
    "touch",
  );

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // UI State shared across layouts
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [focusArea, setFocusArea] = useState<
    "search" | "cart" | "payment" | "customer"
  >("search");
  const [searchFocusTrigger, setSearchFocusTrigger] = useState(0);

  // Payment Selector State
  const {
    isOpen: isSelectorOpen,
    onOpen: onSelectorOpen,
    onOpenChange: onSelectorOpenChange,
  } = useDisclosure();
  const [selectorMethods, setSelectorMethods] = useState<PaymentMethod[]>([]);
  const [selectorTitle, setSelectorTitle] = useState("");

  // Calculations
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

  const fetchActiveSession = async () => {
    if (!vendor?.id) return;
    try {
      const response: any = await api.get("/pos/active-session");

      setActiveSession(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setActiveSession(null);
      } else {
        console.error("Failed to fetch active session", error);
      }
    } finally {
      setCheckingSession(false);
    }
  };

  const fetchCategories = useCallback(async () => {
    const vId = vendor?.id || vendorId;
    if (!vId) return;
    try {
      const response: any = await api.get(`/categories`, {
        params: { vendor_id: vId, per_page: -1 },
      });
      const cats = Array.isArray(response.data) ? response.data : (response.data.data || []);
      setCategories(cats);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  }, [vendor?.id, vendorId]);

  useEffect(() => {
    const vId = vendor?.id || vendorId;
    if (vId) {
      fetchActiveSession();
      fetchCategories();
    }
  }, [vendor?.id, vendorId, fetchCategories]);

  useEffect(() => {
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

  // Auto-select Cash
  useEffect(() => {
    if (!activeTab || paymentMethods.length === 0 || !isInitialized) return;

    const cashMethod = paymentMethods.find(
      (pm) => pm.type === "billing_counter",
    );
    if (!cashMethod) return;

    const existingPayments = activeTab.payments || [];
    const hasCash = existingPayments.some((p) => p.methodId === cashMethod.id);

    if (!hasCash && existingPayments.length === 0) {
      addPayment({
        methodId: cashMethod.id,
        methodName: cashMethod.name,
        isCash: true,
        tenderedAmount: 0,
        appliedAmount: 0,
        changeAmount: 0,
      });
    }
  }, [activeTab?.id, paymentMethods, isInitialized]);

  useEffect(() => {
    if (!checkingSession && !activeSession) {
      onOpen();
    }
  }, [checkingSession, activeSession]);

  const handleProductSelect = async (item: any, query: string) => {
    try {
      const batchRes: any = await api.get(
        `/pos/products/stocks?variant_id=${item.id}`,
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

        addToCart(productObj, variantObj, batches[0], 1);

        // Barcode detection: if it matches query exactly, keep focus on search
        const isBarcode =
          String(item.barcode).toLowerCase() === query.toLowerCase();

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

  const handleProductSearch = async (query: string): Promise<any[]> => {
    if (!query) return [];
    try {
      const res: any = await api.get(`/pos/products?search=${query}`);

      return res.data.data || (Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      return [];
    }
  };

  const handleAddPaymentByType = useCallback(
    (targetType: string) => {
      if (!activeTab) return;

      // Find methods of this type that aren't already added
      const availableMethods = paymentMethods.filter(
        (pm: PaymentMethod) =>
          pm.type === targetType &&
          !(activeTab.payments || []).some((p: any) => p.methodId === pm.id),
      );

      if (availableMethods.length === 1) {
        const method = availableMethods[0];
        addPayment({
          methodId: method.id,
          methodName: method.name,
          isCash: targetType === "billing_counter",
          tenderedAmount: remaining > 0 ? remaining : 0,
          appliedAmount: remaining > 0 ? remaining : 0,
          changeAmount: 0,
        });
        setFocusArea("payment");
      } else if (availableMethods.length > 1) {
        setSelectorMethods(availableMethods);
        setSelectorTitle(`Select ${targetType.replace("_", " ")} Method`);
        onSelectorOpen();
      } else {
        const hasAny = paymentMethods.some(
          (pm: PaymentMethod) => pm.type === targetType,
        );
        if (!hasAny) {
          toast.error(`No ${targetType} payment method configured`);
        } else {
          toast.error(`All available ${targetType} methods are already added`);
        }
      }
    },
    [activeTab, paymentMethods, remaining, addPayment, onSelectorOpen],
  );

  const handleCheckout = useCallback(async () => {
    if (!activeSession || !vendor?.id) return;

    if ((activeTab.payments || []).length === 0) {
      toast.error("Please add at least one payment method");

      return;
    }

    const itemsTotal = (activeTab.items || []).reduce(
      (sum, i) => sum + i.total,
      0,
    );
    const subtotal = (activeTab.items || []).reduce(
      (sum, i) => sum + i.subtotal,
      0,
    );

    const globalDiscount =
      activeTab.discount_type === "percentage"
        ? (subtotal * activeTab.discount_value) / 100
        : activeTab.discount_value;

    const total = itemsTotal - globalDiscount + (activeTab.extra_charge || 0);

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
        subtotal_amount: subtotal,
        total_discount_amount:
          (activeTab.items || []).reduce((sum, i) => sum + i.discount, 0) +
          globalDiscount,
        tax_amount: (activeTab.items || []).reduce(
          (sum, i) => sum + i.tax_amount,
          0,
        ),
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
        const total = (activeTab.items || []).reduce(
          (sum, i) => sum + i.total,
          0,
        );
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
    // Multi-payment helpers for touch/mobile
    updatePayment,
    addPayment,
    removePayment,
    paymentMethods,
    subtotal,
    totalTax,
    itemsTotal,
    globalDiscount,
    grandTotal,
    totalApplied,
    totalChange,
    remaining,
    // New Shared UI State & Handlers
    selectedIndex,
    setSelectedIndex,
    focusArea,
    setFocusArea,
    searchFocusTrigger,
    setSearchFocusTrigger,
    handleProductSearch,
    handleProductSelect,
    handleAddPaymentByType,
    // Selector State
    isSelectorOpen,
    onSelectorOpen,
    onSelectorOpenChange,
    selectorMethods,
    selectorTitle,
    categories,
  };

  console.log("activeSession", activeSession);

  return (
    <PermissionGuard permission="can_use_pos">
      {!activeSession ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-content1">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-black text-default-800 tracking-tight">
              Register is Closed
            </h2>
            <p className="text-default-500">
              You must open a billing counter session to use the POS.
            </p>
            <Button
              color="primary"
              size="lg"
              className="font-bold"
              onPress={onOpen}
            >
              Open Register
            </Button>
          </div>
        </div>
      ) : posMode === "keyboard" ? (
        <KeyboardPOS {...posProps} vendorId={vendorId} />
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
