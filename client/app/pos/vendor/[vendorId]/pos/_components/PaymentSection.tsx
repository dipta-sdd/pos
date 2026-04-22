"use client";

import { useState, useEffect } from "react";
import { Input, Card, CardBody, Divider } from "@heroui/react";
import {
  CreditCard,
  Banknote,
  Landmark,
  Smartphone,
  Receipt,
} from "lucide-react";

import { PaymentMethod } from "@/lib/types/general";
import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";

interface PaymentSectionProps {
  selectedMethodId: number | null;
  receivedAmount: number;
  total: number;
  onMethodSelect: (id: number, name: string) => void;
  onAmountChange: (amount: number) => void;
}

export default function PaymentSection({
  selectedMethodId,
  receivedAmount,
  total,
  onMethodSelect,
  onAmountChange,
}: PaymentSectionProps) {
  const { vendor } = useVendor();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    const fetchMethods = async () => {
      if (!vendor?.id) return;
      try {
        const response: any = await api.get(`/payment-methods`, {
          params: { vendor_id: vendor.id },
        });

        setMethods(response.data.data.filter((m: any) => m.is_active));
      } catch (error) {
        console.error("Failed to fetch payment methods", error);
      }
    };

    fetchMethods();
  }, [vendor?.id]);

  const change = Math.max(0, receivedAmount - total);

  const getIcon = (name: string) => {
    const n = name.toLowerCase();

    if (n.includes("cash")) return <Banknote className="w-5 h-5" />;
    if (n.includes("card")) return <CreditCard className="w-5 h-5" />;
    if (n.includes("bank")) return <Landmark className="w-5 h-5" />;
    if (n.includes("mobile")) return <Smartphone className="w-5 h-5" />;

    return <Receipt className="w-5 h-5" />;
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold text-default-500 uppercase mb-3">
          Payment Method
        </p>
        <div className="grid grid-cols-2 gap-2">
          {methods.map((method) => (
            <Card
              key={method.id}
              isPressable
              className={`
                border-2 transition-all shadow-none
                ${selectedMethodId === method.id ? "border-primary bg-primary-50 dark:bg-primary-900/20" : "border-default-100 hover:border-default-300"}
              `}
              onPress={() => onMethodSelect(method.id, method.name)}
            >
              <CardBody className="p-3 flex flex-row items-center gap-3">
                <div
                  className={`${selectedMethodId === method.id ? "text-primary" : "text-default-400"}`}
                >
                  {getIcon(method.name)}
                </div>
                <span
                  className={`text-xs font-bold ${selectedMethodId === method.id ? "text-primary" : "text-default-700"}`}
                >
                  {method.name}
                </span>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      <Divider />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-bold text-default-500 uppercase mb-2">
            Received Amount
          </p>
          <Input
            className="font-mono font-bold"
            placeholder="0.00"
            size="lg"
            startContent={<span className="text-default-400">$</span>}
            type="number"
            value={receivedAmount.toString()}
            variant="bordered"
            onValueChange={(val) => onAmountChange(Number(val) || 0)}
          />
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-default-500 uppercase mb-2">
            Change
          </p>
          <p
            className={`text-2xl font-black font-mono ${change > 0 ? "text-success" : "text-default-400"}`}
          >
            ${change.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
