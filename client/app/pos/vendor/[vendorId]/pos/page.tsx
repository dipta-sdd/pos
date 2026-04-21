"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody } from "@heroui/card";
import { Search, ShoppingCart, User, CreditCard, LayoutPanelTop, AlertCircle } from "lucide-react";
import { useDisclosure } from "@heroui/modal";

import PermissionGuard from "@/components/auth/PermissionGuard";
import { useVendor } from "@/lib/contexts/VendorContext";
import { UserLoding } from "@/components/user-loding";
import api from "@/lib/api";
import { CashRegisterSession } from "@/lib/types/general";
import RegisterStatusModal from "./_components/RegisterStatusModal";

export default function PointOfSalePage() {
  const { vendor, isLoading: contextLoading } = useVendor();
  const [activeSession, setActiveSession] = useState<CashRegisterSession | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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

  // If no session is active, automatically open the register modal on mount (if user has permission)
  useEffect(() => {
    if (!checkingSession && !activeSession) {
      onOpen();
    }
  }, [checkingSession, activeSession]);

  if (contextLoading || checkingSession) return <UserLoding />;

  return (
    <PermissionGuard permission="can_use_pos">
      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-100 dark:bg-gray-900">
        
        {/* POS Header / Toolbar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 flex justify-between items-center px-6">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-xl hidden md:block">POS Terminal</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-default-100 rounded-full text-xs font-medium">
               <div className={`w-2 h-2 rounded-full ${activeSession ? "bg-success" : "bg-danger animate-pulse"}`} />
               {activeSession ? `Register: ${activeSession.billing_counter?.name || "Active"}` : "Register Closed"}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="flat" 
              color={activeSession ? "default" : "primary"}
              startContent={<LayoutPanelTop className="w-4 h-4" />}
              onPress={onOpen}
            >
              {activeSession ? "Manage Register" : "Open Register"}
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative">
          
          {/* Locked State Overlay */}
          {!activeSession && (
            <div className="absolute inset-0 z-50 bg-white/60 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <Card className="max-w-md w-full mx-4 shadow-2xl">
                <CardBody className="p-8 text-center space-y-6">
                  <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Register is Closed</h2>
                    <p className="text-default-500">
                      You must open a cash register session before you can process any sales.
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

          {/* Left Side: Product Selection */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            <div className="mb-4">
              <Input
                className="w-full"
                placeholder="Search products by name or SKU..."
                size="lg"
                startContent={<Search className="text-gray-400" />}
              />
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
              {/* Product Placeholders */}
              {Array.from({ length: 12 }).map((_, i) => (
                <Card
                  key={i}
                  isPressable
                  className="hover:scale-105 transition-transform"
                >
                  <CardBody className="p-0">
                    <div className="aspect-square bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-400">Product Image</span>
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-sm truncate">
                        Premium Product {i + 1}
                      </p>
                      <p className="text-blue-600 font-bold">$99.00</p>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Side: Cart & Checkout */}
          <div className="w-full lg:w-[400px] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="font-bold flex items-center gap-2 text-lg">
                <ShoppingCart className="w-5 h-5" /> Current Sale
              </h2>
              <Button color="danger" size="sm" variant="light">
                Clear Cart
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-gray-400 text-center">
              <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
              <p>Your cart is empty</p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 space-y-4 border-t border-gray-200 dark:border-gray-700">
              <Button className="w-full justify-between" variant="bordered">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" /> Add Customer
                </div>
                <span>Walk-in</span>
              </Button>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between font-bold text-xl pt-2 border-t">
                  <span>Total</span>
                  <span>$0.00</span>
                </div>
              </div>

              <Button
                className="w-full font-bold h-14"
                color="primary"
                disabled={!activeSession}
                size="lg"
                startContent={<CreditCard />}
              >
                Pay Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      <RegisterStatusModal 
        activeSession={activeSession}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onSessionChange={fetchActiveSession}
      />
    </PermissionGuard>
  );
}
