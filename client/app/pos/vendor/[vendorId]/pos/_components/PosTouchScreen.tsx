"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardBody, Button, Chip, Divider, ScrollShadow, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure, Input } from "@heroui/react";
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
import api from "@/lib/api";

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
    categories,
  } = props;

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { isOpen: isCustomerOpen, onOpen: onCustomerOpen, onOpenChange: onCustomerOpenChange } = useDisclosure();
  
  // Customer Modal State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [custName, setCustName] = useState("");
  const [custMobile, setCustMobile] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Sync modal state with current active tab customer
  useEffect(() => {
    if (activeTab?.customer) {
      setCustName(activeTab.customer.name);
      setCustMobile(activeTab.customer.phone || activeTab.customer.mobile || "");
    } else if (activeTab?.tempCustomer) {
      setCustName(activeTab.tempCustomer.name);
      setCustMobile(activeTab.tempCustomer.mobile);
    } else {
      setCustName("");
      setCustMobile("");
    }
  }, [activeTab?.id, activeTab?.customer, activeTab?.tempCustomer]);

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

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#0f1115] text-white overflow-hidden font-sans">
      {/* MAIN CONTENT AREA (Left + Center) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* TOP ROW: Search & Tabs */}
        <div className="p-6 pb-0 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1 max-w-xl relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search products, variants or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 bg-[#16191f] border border-white/5 rounded-2xl pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-primary/50 transition-all placeholder:text-gray-600 shadow-inner"
              />
            </div>

            <div className="flex items-center gap-2 bg-[#16191f] p-1.5 rounded-2xl border border-white/5 shadow-inner">
              {state.tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "px-6 h-11 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    activeTab.id === tab.id 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "text-gray-500 hover:text-gray-300"
                  )}
                >
                  {tab.name}
                </button>
              ))}
              <button 
                onClick={addTab}
                className="w-11 h-11 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 flex items-center justify-center transition-all"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* CATEGORY ROW */}
          <ScrollShadow orientation="horizontal" className="flex items-center gap-3 pb-4 no-scrollbar">
            <button
              onClick={() => setActiveCategory("all")}
              className={clsx(
                "px-6 h-12 rounded-2xl flex items-center gap-2 transition-all duration-300 border font-bold text-xs uppercase tracking-wider whitespace-nowrap",
                activeCategory === "all" 
                  ? "bg-primary border-primary text-white shadow-xl shadow-primary/20" 
                  : "bg-[#16191f] border-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300"
              )}
            >
              <LayoutGrid size={16} />
              All Items
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={clsx(
                  "px-6 h-12 rounded-2xl flex items-center gap-2 transition-all duration-300 border font-bold text-xs uppercase tracking-wider whitespace-nowrap",
                  activeCategory === cat.id 
                    ? "bg-primary border-primary text-white shadow-xl shadow-primary/20" 
                    : "bg-[#16191f] border-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300"
                )}
              >
                <Package size={16} />
                {cat.name}
              </button>
            ))}
          </ScrollShadow>
        </div>

        {/* Product Grid Container */}
        <div className="flex-1 overflow-hidden px-6 pb-6">
          <div className="h-full relative rounded-[2rem] bg-[#16191f]/40 border border-white/5 backdrop-blur-sm p-4 shadow-2xl">
             <ProductSelection 
               onSelect={(p, v, b) => props.addToCart(p, v, b, 1)} 
               category={activeCategory}
               search={searchQuery}
             />
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: CART & CHECKOUT */}
      <div className="w-[440px] bg-[#16191f] border-l border-white/5 flex flex-col overflow-hidden relative shadow-2xl">
        {/* Customer Info */}
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
              <ShoppingCart size={24} className="text-primary" />
              Order Summary
            </h3>
            <Chip size="lg" variant="flat" color="primary" className="font-black px-4 h-8 rounded-xl">
              {activeTab.items.length}
            </Chip>
          </div>
          
          <button 
            onClick={onCustomerOpen}
            className="w-full h-16 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 flex items-center px-5 gap-4 transition-all group shadow-inner"
          >
            <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <User size={20} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-black text-gray-200">
                {activeTab.customer?.name || activeTab.tempCustomer?.name || "Walk-in Customer"}
              </p>
              <p className="text-[11px] text-gray-500 font-bold tracking-tight">
                {activeTab.customer?.mobile || activeTab.customer?.phone || activeTab.tempCustomer?.mobile || "Tap to select customer"}
              </p>
            </div>
            <ChevronRight size={20} className="text-gray-700" />
          </button>
        </div>

        {/* Cart Items */}
        <ScrollShadow className="flex-1 p-8 pt-4 flex flex-col gap-6 no-scrollbar">
          {activeTab.items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-10 py-20">
              <ShoppingCart size={100} className="mb-6" />
              <p className="font-black uppercase tracking-[0.2em] text-lg">Empty Cart</p>
            </div>
          ) : (
            activeTab.items.map((item) => (
              <div key={item.id} className="flex items-start gap-4 group">
                <div className="w-16 h-16 bg-white/5 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/5">
                  {item.product.image_url ? (
                    <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Package size={24} className="text-gray-700" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-black uppercase tracking-tight text-gray-200 truncate leading-tight mb-1">
                    {item.product?.name || "Unknown Product"}
                  </p>
                  <p className="text-[10px] text-gray-500 font-bold truncate mb-3 uppercase tracking-tighter">
                    {item.variant?.name || item.variant?.value || "Standard"} • Batch: {item.batch?.batch_no || item.batch?.id || "N/A"}
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => updateCartItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                      className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 transition-colors border border-white/5"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-black w-8 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateCartItem(item.id, { quantity: item.quantity + 1 })}
                      className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 transition-colors border border-white/5"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white">৳{item.total.toLocaleString()}</p>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="mt-4 text-gray-600 hover:text-danger transition-colors p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </ScrollShadow>

        {/* Order Summary & Pay Button */}
        <div className="p-8 bg-[#1b1f26] border-t border-white/5 rounded-t-[3rem] shadow-[0_-20px_60px_rgba(0,0,0,0.5)] z-10">
          <div className="space-y-3 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Subtotal</span>
              <span className="font-black text-gray-300">৳{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Tax Amount</span>
              <span className="font-black text-gray-300">৳{totalTax.toLocaleString()}</span>
            </div>
            
            {/* Payment Method Selector */}
            <div className="py-4 px-5 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group mt-4 shadow-inner">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 text-primary rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest leading-none mb-1.5">Payment</p>
                  <p className="text-[15px] font-black text-white leading-none">
                    {activeTab.payments?.[0]?.methodName || "Select Mode"}
                  </p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="flat" 
                color="primary" 
                className="font-black text-[10px] uppercase h-9 px-6 rounded-xl"
                onPress={() => props.handleAddPaymentByType("card")}
              >
                Change
              </Button>
            </div>

            <Divider className="bg-white/5 my-4" />
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-black uppercase tracking-[0.2em] text-[11px]">Payable</span>
              <span className="text-4xl font-black text-primary tracking-tighter">৳{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <Button 
            className="w-full h-20 rounded-[1.5rem] bg-primary text-white font-black text-2xl tracking-[0.1em] shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all mb-2"
            onPress={handleCheckout}
            isDisabled={activeTab.items.length === 0 || isProcessing}
            isLoading={isProcessing}
          >
            PROCESS SALE
          </Button>
        </div>
      </div>

      {/* Customer Selection Modal */}
      <Modal 
        isOpen={isCustomerOpen} 
        onOpenChange={onCustomerOpenChange}
        className="bg-[#16191f] text-white border border-white/10 rounded-[2.5rem]"
        size="2xl"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="p-8 pb-4 flex justify-between items-center">
                 <div className="flex flex-col">
                    <span className="font-black uppercase tracking-tight text-2xl">Customer Details</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Select or enter walk-in info</span>
                 </div>
                 <Button size="sm" variant="flat" color="danger" className="font-bold text-[10px]" onPress={clearCustomer}>CLEAR</Button>
              </ModalHeader>
              <ModalBody className="p-8 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Input
                    label="Customer Name"
                    placeholder="Walk-in Customer"
                    variant="bordered"
                    size="lg"
                    value={custName}
                    onValueChange={handleCustNameChange}
                    startContent={<User size={20} className="text-primary" />}
                    classNames={{
                      inputWrapper: "h-16 rounded-2xl border-white/5 bg-white/5 focus-within:border-primary",
                      label: "font-black uppercase tracking-widest text-[10px] text-gray-500"
                    }}
                  />
                  <Input
                    label="Mobile Number"
                    placeholder="01XXXXXXXXX"
                    variant="bordered"
                    size="lg"
                    value={custMobile}
                    onValueChange={handleCustMobileChange}
                    startContent={<Phone size={20} className="text-primary" />}
                    classNames={{
                      inputWrapper: "h-16 rounded-2xl border-white/5 bg-white/5 focus-within:border-primary",
                      label: "font-black uppercase tracking-widest text-[10px] text-gray-500"
                    }}
                  />
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Divider className="flex-1 bg-white/5" />
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Search Results</span>
                  <Divider className="flex-1 bg-white/5" />
                </div>

                <ScrollShadow className="h-[350px] no-scrollbar">
                  <div className="grid grid-cols-1 gap-3">
                    {isLoading ? (
                      <div className="py-20 text-center opacity-20 italic">Searching...</div>
                    ) : customers.length === 0 ? (
                      <div className="py-20 text-center flex flex-col items-center opacity-20">
                         <UserPlus size={48} className="mb-4" />
                         <p className="font-bold text-xs uppercase tracking-widest">No matching customers</p>
                      </div>
                    ) : (
                      customers.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            updateActiveTab({ customer: c, tempCustomer: undefined });
                            onClose();
                          }}
                          className="w-full p-6 bg-white/5 hover:bg-primary/20 rounded-3xl text-left border border-white/5 transition-all flex items-center justify-between group shadow-lg"
                        >
                          <div>
                            <p className="font-black text-lg text-gray-200 group-hover:text-primary transition-colors">{c.name}</p>
                            <p className="text-xs text-gray-500 font-bold tracking-widest mt-1">{c.phone || c.mobile || "No Mobile"}</p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                            <ChevronRight size={20} />
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollShadow>

                <Button 
                  className="w-full h-16 rounded-2xl bg-white/5 hover:bg-white/10 mt-6 font-black uppercase tracking-widest text-xs border border-white/5"
                  onPress={onClose}
                >
                  Confirm Walk-in / Close
                </Button>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Register Closed Overlay */}
      {!activeSession && (
        <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
          <Card className="max-w-md w-full bg-[#16191f] border border-white/10 shadow-2xl rounded-[3rem] p-4">
            <CardBody className="p-10 text-center space-y-8">
              <div className="w-24 h-24 bg-danger/10 text-danger rounded-[2rem] flex items-center justify-center mx-auto shadow-inner border border-danger/20">
                <AlertCircle size={48} />
              </div>
              <div>
                <h2 className="text-3xl font-black mb-4 tracking-tight uppercase">Register Locked</h2>
                <p className="text-gray-500 leading-relaxed font-medium">
                  A cash register session is required to start selling. Please open a session now.
                </p>
              </div>
              <Button 
                className="w-full h-20 rounded-[1.5rem] bg-primary text-white font-black text-xl shadow-2xl shadow-primary/30 tracking-widest"
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
