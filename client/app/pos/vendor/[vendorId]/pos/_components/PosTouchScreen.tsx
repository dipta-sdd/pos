"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Divider,
  ScrollShadow,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Input,
} from "@heroui/react";
import {
  AlertCircle,
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ChevronRight,
  User,
  LayoutGrid,
  Zap,
  Package,
  Phone,
  UserPlus,
  X,
  CreditCard,
  Banknote,
  Globe,
  ChevronLeft,
} from "lucide-react";
import clsx from "clsx";
import debounce from "lodash/debounce";

import {
  CashRegisterSession,
  Product,
  Variant,
  ProductStock,
  PaymentMethod,
  Customer,
} from "@/lib/types/general";
import { PosTab, CartItem, PosState, PosPayment } from "@/lib/types/pos";
import ProductSelection from "./ProductSelection";
import { PaymentMethodSelectorModal } from "./keyboard/PaymentMethodSelectorModal";
import api, { BACKEND_URL } from "@/lib/api";

interface PosTouchScreenProps {
  state: PosState;
  activeTab: PosTab;
  activeSession: CashRegisterSession | null;
  isProcessing: boolean;
  onOpen: () => void;
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
  // Payment helpers
  addPayment: (payment: Omit<PosPayment, "id">) => void;
  updatePayment: (id: string, updates: Partial<PosPayment>) => void;
  removePayment: (id: string) => void;
  handleAddPaymentByType: (type: string) => void;
  // Selector State
  isSelectorOpen: boolean;
  onSelectorOpen: () => void;
  onSelectorOpenChange: (isOpen: boolean) => void;
  selectorMethods: PaymentMethod[];
  selectorTitle: string;
  // Shared Props
  paymentMethods: PaymentMethod[];
  categories: any[];
  subtotal: number;
  totalTax: number;
  itemsTotal: number;
  globalDiscount: number;
  grandTotal: number;
  totalApplied: number;
  totalChange: number;
  remaining: number;
}

export default function PosTouchScreen(props: PosTouchScreenProps) {
  const {
    state,
    activeTab,
    activeSession,
    isProcessing,
    onOpen,
    addTab,
    setActiveTab,
    updateActiveTab,
    updateCartItem,
    removeFromCart,
    handleCheckout,
    subtotal,
    totalTax,
    grandTotal,
    remaining,
    totalApplied,
    totalChange,
    categories,
    globalDiscount,
    updatePayment,
    removePayment,
    handleAddPaymentByType,
    isSelectorOpen,
    onSelectorOpenChange,
    selectorMethods,
    selectorTitle,
    paymentMethods,
  } = props;

  const [sidebarMode, setSidebarMode] = useState<"cart" | "payment">("cart");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const {
    isOpen: isCustomerOpen,
    onOpen: onCustomerOpen,
    onOpenChange: onCustomerOpenChange,
  } = useDisclosure();

  // Customer Modal State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [custName, setCustName] = useState("");
  const [custMobile, setCustMobile] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Sync modal state with current active tab customer
  useEffect(() => {
    if (activeTab?.customer) {
      setCustName(activeTab.customer.name);
      setCustMobile(activeTab.customer.phone || "");
    } else if (activeTab?.tempCustomer) {
      setCustName(activeTab.tempCustomer.name);
      setCustMobile(activeTab.tempCustomer.mobile);
    } else {
      setCustName("");
      setCustMobile("");
    }
  }, [activeTab?.id, activeTab?.customer, activeTab?.tempCustomer]);

  // Reset sidebar mode when switching tabs
  useEffect(() => {
    setSidebarMode("cart");
  }, [activeTab?.id]);

  const fetchCustomers = async (q: string) => {
    if (!q || q.length < 2) {
      setCustomers([]);
      return;
    }
    setIsLoading(true);
    try {
      const res: any = await api.get(`/pos/customers?search=${q}`);
      setCustomers(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useCallback(debounce(fetchCustomers, 300), []);

  const handleCustNameChange = (val: string) => {
    setCustName(val);
    updateActiveTab({ tempCustomer: { name: val, mobile: custMobile } });
    if (!activeTab?.customer) debouncedSearch(val);
  };

  const handleCustMobileChange = (val: string) => {
    setCustMobile(val);
    updateActiveTab({ tempCustomer: { name: custName, mobile: val } });
    if (!activeTab?.customer) debouncedSearch(val);
  };

  const clearCustomer = () => {
    updateActiveTab({ customer: null, tempCustomer: undefined });
    setCustName("");
    setCustMobile("");
    setCustomers([]);
  };

  if (!activeTab) return null;
  console.log(activeTab);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-background text-foreground overflow-hidden font-sans">
      {/* MAIN CONTENT AREA (Left + Center) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden border-r border-default-100">
        {/* TOP ROW: Search & Tabs */}
        <div className="p-4 pb-0 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-xl relative group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 bg-content1 border border-default-100 rounded-xl pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-primary/50 transition-all placeholder:text-default-400 shadow-inner"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-content1 p-1 rounded-xl border border-default-100 shadow-inner">
              {state.tabs.map((tab) => (
                <div key={tab.id} className="relative flex items-center">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      "px-4 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 pr-8",
                      activeTab.id === tab.id
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "text-gray-500 hover:text-gray-300",
                    )}
                  >
                    {tab.name}
                  </button>
                  {state.tabs.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        props.closeTab(tab.id);
                      }}
                      className={clsx(
                        "absolute right-1 w-5 h-5 rounded-md flex items-center justify-center transition-colors",
                        activeTab.id === tab.id
                          ? "bg-white/20 text-white hover:bg-white/30"
                          : "text-gray-600 hover:text-danger hover:bg-danger/10",
                      )}
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addTab}
                className="w-9 h-9 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 flex items-center justify-center transition-all"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* CATEGORY ROW */}
          <ScrollShadow
            orientation="horizontal"
            className="flex items-center gap-2 pb-3 no-scrollbar"
          >
            <button
              onClick={() => setActiveCategory("all")}
              className={clsx(
                "px-5 h-10 rounded-xl flex items-center gap-2 transition-all duration-300 border font-bold text-[10px] uppercase tracking-wider whitespace-nowrap",
                activeCategory === "all"
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                  : "bg-content1 border-default-100 text-default-500 hover:border-default-200 hover:text-foreground",
              )}
            >
              <LayoutGrid size={14} />
              All
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={clsx(
                  "px-5 h-10 rounded-xl flex items-center gap-2 transition-all duration-300 border font-bold text-[10px] uppercase tracking-wider whitespace-nowrap",
                  activeCategory === cat.id
                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                    : "bg-content1 border-default-100 text-default-500 hover:border-default-200 hover:text-foreground",
                )}
              >
                <Package size={14} />
                {cat.name}
              </button>
            ))}
          </ScrollShadow>
        </div>

        {/* Product Grid Container */}
        <div className="flex-1 overflow-hidden px-4 pb-4">
          <div className="h-full relative rounded-2xl bg-content1/40 border border-default-100 backdrop-blur-sm p-3 shadow-2xl">
            <ProductSelection
              onSelect={(p, v, b) => props.addToCart(p, v, b, 1)}
              category={activeCategory}
              search={searchQuery}
            />
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: CART & CHECKOUT */}
      <div className="w-[380px] bg-content1 flex flex-col overflow-hidden relative">
        {sidebarMode === "cart" ? (
          <>
            {/* Customer Info */}
            <div className="p-5 border-b border-default-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2 text-foreground">
                  <ShoppingCart size={18} className="text-primary" />
                  Cart Summary
                </h3>
                <Chip
                  size="sm"
                  variant="flat"
                  color="primary"
                  className="font-black px-2 h-6 rounded-lg text-[10px]"
                >
                  {activeTab.items.length} ITEMS
                </Chip>
              </div>

              <button
                onClick={onCustomerOpen}
                className="w-full h-12 bg-content1 hover:bg-content2 rounded-xl border border-default-100 flex items-center px-4 gap-3 transition-all group shadow-inner"
              >
                <div className="w-8 h-8 bg-primary/20 text-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <User size={16} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[11px] font-black text-foreground truncate">
                    {activeTab.customer?.name ||
                      activeTab.tempCustomer?.name ||
                      "Walk-in Customer"}
                  </p>
                  <p className="text-[9px] text-default-500 font-bold tracking-tight truncate">
                    {activeTab.customer?.phone ||
                      activeTab.tempCustomer?.mobile ||
                      "Select customer"}
                  </p>
                </div>
                <ChevronRight size={16} className="text-gray-700" />
              </button>
            </div>

            {/* Cart Items */}
            <ScrollShadow className="flex-1 p-5 pt-3 flex flex-col gap-4 no-scrollbar">
              {activeTab.items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-10 py-10">
                  <ShoppingCart size={60} className="mb-4" />
                  <p className="font-black uppercase tracking-widest text-xs">
                    Empty Cart
                  </p>
                </div>
              ) : (
                activeTab.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 group animate-in fade-in slide-in-from-right-2 duration-200"
                  >
                    <div className="w-12 h-12 bg-default-100 dark:bg-white/5 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-default-200 dark:border-white/5">
                      {item.product.image_url ? (
                        <img
                          src={BACKEND_URL + item.product.image_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package size={20} className="text-default-400 dark:text-white/20" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-tight text-foreground truncate leading-tight mb-0.5">
                        {item.product?.name || "Unknown Product"}
                      </p>
                      <p className="text-[9px] text-default-500 font-bold truncate mb-2 uppercase tracking-tighter">
                        {(() => {
                          const vName = item.variant?.name?.toLowerCase() || "";
                          const vValue =
                            item.variant?.value?.toLowerCase() || "";
                          const isDefault =
                            vName.includes("default") ||
                            vName.includes("standard") ||
                            vValue.includes("default") ||
                            vValue.includes("standard");

                          if (isDefault) return `B: ${item.batch?.id || "N/A"}`;
                          return `${item.variant?.name}: ${item.variant?.value} • B: ${item.batch?.id || "N/A"}`;
                        })()}
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateCartItem(item.id, {
                              quantity: Math.max(1, item.quantity - 1),
                            })
                          }
                          className="w-6 h-6 rounded-lg bg-default-100 hover:bg-default-200 flex items-center justify-center text-default-400 transition-colors border border-default-100"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-[11px] font-black w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateCartItem(item.id, {
                              quantity: item.quantity + 1,
                            })
                          }
                          className="w-6 h-6 rounded-lg bg-default-100 hover:bg-default-200 flex items-center justify-center text-default-400 transition-colors border border-default-100"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-black text-foreground">
                        ৳{item.total.toLocaleString()}
                      </p>
                      <p className="text-[9px] text-default-500 font-bold mt-0.5 tracking-tighter">
                        ৳{item.price.toLocaleString()} × {item.quantity}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="mt-2 text-gray-700 hover:text-danger transition-colors p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </ScrollShadow>

            {/* Summary, Discount, Coupon & Proceed */}
            <div className="p-5 bg-content2 border-t border-default-100 rounded-t-[2rem] shadow-2xl">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-[10px]">
                  <span className="text-default-500 font-black uppercase tracking-widest">
                    Subtotal
                  </span>
                  <span className="font-black text-default-400">
                    ৳{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-default-500 font-black uppercase tracking-widest">
                    VAT (5%)
                  </span>
                  <span className="font-black text-default-400">
                    ৳{totalTax.toLocaleString()}
                  </span>
                </div>

                {/* Discount Row */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="text-[10px] font-black text-default-500 uppercase tracking-widest whitespace-nowrap">
                    Discount
                  </span>
                  <div className="flex gap-2 items-center">
                    <input
                      className="w-20 h-8 bg-default-100 border border-default-100 rounded-lg px-3 text-xs font-mono text-white focus:outline-none focus:border-primary/50"
                      placeholder="0"
                      type="number"
                      value={activeTab.discount_value || ""}
                      onChange={(e) =>
                        updateActiveTab({
                          discount_value: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <div className="flex bg-default-100 p-0.5 rounded-lg h-8 border border-default-200">
                      <button
                        className={clsx(
                          "px-2.5 text-[10px] font-black rounded-md transition-all",
                          activeTab.discount_type === "percentage"
                            ? "bg-primary text-white"
                            : "text-default-500",
                        )}
                        onClick={() =>
                          updateActiveTab({ discount_type: "percentage" })
                        }
                      >
                        %
                      </button>
                      <button
                        className={clsx(
                          "px-2.5 text-[10px] font-black rounded-md transition-all",
                          activeTab.discount_type === "fixed"
                            ? "bg-primary text-white"
                            : "text-default-500",
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
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black text-default-500 uppercase tracking-widest whitespace-nowrap">
                    Coupon
                  </span>
                  <div className="flex gap-2 items-center">
                    <input
                      className="w-24 h-8 bg-default-100 border border-default-200 rounded-lg px-3 text-xs text-foreground focus:outline-none focus:border-primary/50 uppercase"
                      placeholder="CODE"
                      value={activeTab.coupon_code || ""}
                      onChange={(e) =>
                        updateActiveTab({ coupon_code: e.target.value })
                      }
                    />
                    <button className="h-8 px-3 bg-primary/20 text-primary text-[9px] font-black rounded-lg uppercase tracking-wider hover:bg-primary/30 transition-colors">
                      Apply
                    </button>
                  </div>
                </div>

                {/* Extra Charge Row */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black text-default-500 uppercase tracking-widest whitespace-nowrap">
                    Extra
                  </span>
                  <input
                    className="w-20 h-8 bg-default-100 border border-default-100 rounded-lg px-3 text-xs font-mono text-white focus:outline-none focus:border-primary/50"
                    placeholder="0"
                    type="number"
                    value={activeTab.extra_charge || ""}
                    onChange={(e) =>
                      updateActiveTab({
                        extra_charge: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                {globalDiscount > 0 && (
                  <div className="flex justify-between text-[10px]">
                    <span className="text-warning font-black uppercase tracking-widest">
                      Discount Applied
                    </span>
                    <span className="font-black text-warning">
                      -৳{globalDiscount.toLocaleString()}
                    </span>
                  </div>
                )}

                <Divider className="bg-default-100 my-1" />
                <div className="flex justify-between items-center">
                  <span className="text-default-400 font-black uppercase tracking-[0.1em] text-[10px]">
                    Grand Total
                  </span>
                  <span className="text-2xl font-black text-primary tracking-tighter">
                    ৳{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <Button
                className="w-full h-14 rounded-xl bg-primary text-white font-black text-sm tracking-[0.1em] shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all"
                onPress={() => setSidebarMode("payment")}
                isDisabled={activeTab.items.length === 0}
              >
                PROCEED TO PAYMENT
                <ChevronRight size={18} className="ml-1" />
              </Button>
            </div>
          </>
        ) : (
          /* PAYMENT VIEW */
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-2 duration-300">
            {/* Payment Header */}
            <div className="p-5 border-b border-default-100 flex items-center justify-between">
              <button
                onClick={() => setSidebarMode("cart")}
                className="flex items-center gap-2 text-default-500 hover:text-foreground transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center group-hover:bg-default-200">
                  <ChevronLeft size={16} />
                </div>
                <span className="font-black uppercase tracking-widest text-[9px]">
                  Cart
                </span>
              </button>
              <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2 text-foreground">
                <Zap size={18} className="text-primary" />
                Payment
              </h3>
            </div>

            <ScrollShadow className="flex-1 p-5 no-scrollbar">
              {/* Financial Summary Card */}
              <div className="bg-default-100 rounded-2xl p-5 border border-default-100 shadow-inner mb-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-black text-default-500 uppercase tracking-widest">
                        Total
                      </span>
                      <span className="text-2xl font-black text-foreground tracking-tighter">
                        ৳{grandTotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right flex flex-col gap-0.5">
                      <span className="text-[9px] font-black text-default-500 uppercase tracking-widest">
                        Paid
                      </span>
                      <span className="text-xl font-black text-primary tracking-tighter">
                        ৳{totalApplied.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Divider className="bg-white/5" />

                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-black text-default-500 uppercase tracking-widest">
                        Balance
                      </span>
                      <span
                        className={clsx(
                          "text-xl font-black tracking-tighter",
                          remaining > 0 ? "text-warning" : "text-success",
                        )}
                      >
                        ৳{remaining.toLocaleString()}
                      </span>
                    </div>
                    {totalChange > 0 && (
                      <div className="text-right flex flex-col gap-0.5">
                        <span className="text-[9px] font-black text-success uppercase tracking-widest">
                          Change
                        </span>
                        <span className="text-xl font-black text-success tracking-tighter">
                          ৳{totalChange.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Applied Payments List */}
              <div className="mb-6">
                <h4 className="text-[9px] font-black text-default-400 uppercase tracking-[0.2em] mb-3 ml-1">
                  Payment Methods
                </h4>
                <div className="space-y-3">
                  {activeTab.payments?.length === 0 ? (
                    <div className="py-8 border border-dashed border-default-200 rounded-xl flex flex-col items-center justify-center opacity-10">
                      <Banknote size={30} className="mb-2" />
                      <p className="text-[8px] font-black uppercase tracking-widest">
                        No payments added
                      </p>
                    </div>
                  ) : (
                    activeTab.payments.map((p) => {
                      const totalAppliedWithoutCurrent = (
                        activeTab.payments || []
                      )
                        .filter((x) => x.id !== p.id)
                        .reduce((sum, x) => sum + x.appliedAmount, 0);
                      const remainingForThis = Math.max(
                        0,
                        grandTotal - totalAppliedWithoutCurrent,
                      );

                      return (
                        <div
                          key={p.id}
                          className="p-4 bg-default-100/50 rounded-xl border border-default-100 space-y-3"
                        >
                          {/* Header */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-primary/20 text-primary rounded-lg flex items-center justify-center">
                                {p.isCash ? (
                                  <Banknote size={14} />
                                ) : p.methodName
                                    .toLowerCase()
                                    .includes("card") ? (
                                  <CreditCard size={14} />
                                ) : (
                                  <Globe size={14} />
                                )}
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                                {p.isCash ? "Cash" : p.methodName}
                              </span>
                            </div>
                            <button
                              onClick={() => removePayment(p.id)}
                              className="w-7 h-7 rounded-lg bg-default-100 text-default-400 hover:text-danger hover:bg-danger/10 flex items-center justify-center transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>

                          {/* Received */}
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[9px] font-bold text-default-500 uppercase tracking-tight">
                              Received
                            </span>
                            <input
                              className="w-28 h-8 bg-default-200 border border-default-100 rounded-lg px-3 text-xs font-mono text-foreground text-right focus:outline-none focus:border-primary/50"
                              type="number"
                              placeholder="0.00"
                              value={p.tenderedAmount || ""}
                              onChange={(e) => {
                                const tAmount = parseFloat(e.target.value) || 0;
                                let applied = p.appliedAmount;
                                if (!p.isManualApplied) {
                                  applied = Math.min(tAmount, remainingForThis);
                                }
                                updatePayment(p.id, {
                                  tenderedAmount: tAmount,
                                  appliedAmount: applied,
                                  changeAmount: p.isCash
                                    ? Math.max(0, tAmount - applied)
                                    : 0,
                                });
                              }}
                            />
                          </div>

                          {/* Reference (non-cash only) */}
                          {!p.isCash && (
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-[9px] font-bold text-default-500 uppercase tracking-tight">
                                Reference
                              </span>
                              <input
                                className="w-28 h-8 bg-default-200 border border-default-100 rounded-lg px-3 text-xs text-foreground text-right focus:outline-none focus:border-primary/50"
                                placeholder="Ref #"
                                value={p.reference || ""}
                                onChange={(e) =>
                                  updatePayment(p.id, {
                                    reference: e.target.value,
                                  })
                                }
                              />
                            </div>
                          )}

                          {/* Change (cash only) */}
                          {p.isCash && (
                            <div className="flex justify-between items-center pt-1 border-t border-default-100">
                              <span className="text-[9px] text-success font-black uppercase tracking-widest">
                                Change
                              </span>
                              <span className="text-sm font-mono font-black text-success">
                                ৳{p.changeAmount.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Quick Add Buttons */}
              <div className="grid grid-cols-2 gap-2">
                {!activeTab.payments.some((p: PosPayment) => p.isCash) && (
                  <Button
                    className="h-12 rounded-xl bg-default-100 border border-default-100 text-[9px] font-black uppercase tracking-widest hover:bg-success/20 transition-all flex items-center justify-center gap-2"
                    onPress={() => handleAddPaymentByType("billing_counter")}
                  >
                    <Banknote size={16} className="text-success" />
                    Cash
                  </Button>
                )}
                <Button
                  className="h-12 rounded-xl bg-default-100 border border-default-100 text-[9px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
                  onPress={() => handleAddPaymentByType("card")}
                >
                  <CreditCard size={16} className="text-primary" />
                  Card
                </Button>
                <Button
                  className="h-12 rounded-xl bg-default-100 border border-default-100 text-[9px] font-black uppercase tracking-widest hover:bg-warning/20 transition-all flex items-center justify-center gap-2"
                  onPress={() => handleAddPaymentByType("online")}
                >
                  <Globe size={16} className="text-warning" />
                  Online
                </Button>
                <Button
                  className="h-12 rounded-xl bg-default-100 border border-default-100 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  onPress={() => handleAddPaymentByType("other")}
                >
                  <Zap size={16} className="text-default-400" />
                  Others
                </Button>
              </div>
            </ScrollShadow>

            {/* Process Sale Button */}
            <div className="p-6 bg-content2 border-t border-default-100 rounded-t-[2rem] shadow-2xl">
              <Button
                className="w-full h-16 rounded-xl bg-success text-white font-black text-lg tracking-[0.1em] shadow-lg shadow-success/20 hover:scale-[1.01] active:scale-95 transition-all"
                onPress={handleCheckout}
                isDisabled={isProcessing || remaining > 0}
                isLoading={isProcessing}
              >
                {remaining > 0
                  ? `DUE: ৳${remaining.toLocaleString()}`
                  : "COMPLETE SALE"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Selection Modal */}
      <Modal
        isOpen={isCustomerOpen}
        onOpenChange={onCustomerOpenChange}
        className="bg-content1 text-foreground border border-default-100 rounded-[2rem]"
        size="2xl"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="p-6 pb-2 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="font-black uppercase tracking-tight text-xl">
                    Customer Details
                  </span>
                  <span className="text-[9px] text-default-500 font-bold uppercase tracking-widest mt-0.5">
                    Select or enter walk-in info
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="flat"
                  color="danger"
                  className="font-bold text-[9px] h-7 min-w-unit-12"
                  onPress={clearCustomer}
                >
                  CLEAR
                </Button>
              </ModalHeader>
              <ModalBody className="p-6 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <Input
                    label="Customer Name"
                    placeholder="Walk-in Customer"
                    variant="bordered"
                    size="sm"
                    value={custName}
                    onValueChange={handleCustNameChange}
                    startContent={<User size={16} className="text-primary" />}
                    classNames={{
                      inputWrapper:
                        "h-12 rounded-xl border-default-100 bg-default-100 focus-within:border-primary",
                      label:
                        "font-black uppercase tracking-widest text-[9px] text-default-500",
                    }}
                  />
                  <Input
                    label="Mobile Number"
                    placeholder="01XXXXXXXXX"
                    variant="bordered"
                    size="sm"
                    value={custMobile}
                    onValueChange={handleCustMobileChange}
                    startContent={<Phone size={16} className="text-primary" />}
                    classNames={{
                      inputWrapper:
                        "h-12 rounded-xl border-default-100 bg-default-100 focus-within:border-primary",
                      label:
                        "font-black uppercase tracking-widest text-[9px] text-default-500",
                    }}
                  />
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Divider className="flex-1 bg-white/5" />
                  <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                    Search Results
                  </span>
                  <Divider className="flex-1 bg-white/5" />
                </div>

                <ScrollShadow className="h-[300px] no-scrollbar">
                  <div className="grid grid-cols-1 gap-2">
                    {isLoading ? (
                      <div className="py-10 text-center opacity-20 italic text-xs">
                        Searching...
                      </div>
                    ) : customers.length === 0 ? (
                      <div className="py-10 text-center flex flex-col items-center opacity-20">
                        <UserPlus size={32} className="mb-2" />
                        <p className="font-bold text-[10px] uppercase tracking-widest">
                          No matching customers
                        </p>
                      </div>
                    ) : (
                      customers.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            updateActiveTab({
                              customer: c,
                              tempCustomer: undefined,
                            });
                            onClose();
                          }}
                          className="w-full p-4 bg-default-100 hover:bg-primary/20 rounded-2xl text-left border border-default-100 transition-all flex items-center justify-between group shadow-md"
                        >
                          <div>
                            <p className="font-black text-base text-foreground group-hover:text-primary transition-colors">
                              {c.name}
                            </p>
                            <p className="text-[10px] text-default-500 font-bold tracking-widest mt-0.5">
                              {c.phone || "No Mobile"}
                            </p>
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-default-100/50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                            <ChevronRight size={16} />
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollShadow>

                <Button
                  className="w-full h-12 rounded-xl bg-white/5 hover:bg-white/10 mt-4 font-black uppercase tracking-widest text-[10px] border border-white/5"
                  onPress={onClose}
                >
                  Confirm & Close
                </Button>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Payment Method Selector Modal */}
      <PaymentMethodSelectorModal
        isOpen={isSelectorOpen}
        onOpenChange={onSelectorOpenChange}
        methods={selectorMethods}
        title={selectorTitle}
        onSelect={(method) => {
          props.addPayment({
            methodId: method.id,
            methodName: method.name,
            isCash: method.type === "billing_counter",
            tenderedAmount: remaining > 0 ? remaining : 0,
            appliedAmount: remaining > 0 ? remaining : 0,
            changeAmount: 0,
          });
        }}
      />

      {/* Register Closed Overlay */}
      {!activeSession && (
        <div className="absolute inset-0 z-[100] bg-background/90 backdrop-blur-xl flex items-center justify-center p-6">
          <Card className="max-w-sm w-full bg-content1 border border-default-100 shadow-2xl rounded-[2.5rem] p-4">
            <CardBody className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-danger/10 text-danger rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-danger/20">
                <AlertCircle size={40} />
              </div>
              <div>
                <h2 className="text-2xl font-black mb-3 tracking-tight uppercase">
                  Register Locked
                </h2>
                <p className="text-default-500 text-sm leading-relaxed font-medium">
                  A cash register session is required. Please open a session to
                  start.
                </p>
              </div>
              <Button
                className="w-full h-16 rounded-xl bg-primary text-white font-black text-base shadow-lg shadow-primary/20 tracking-widest"
                onPress={onOpen}
              >
                OPEN REGISTER
              </Button>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
