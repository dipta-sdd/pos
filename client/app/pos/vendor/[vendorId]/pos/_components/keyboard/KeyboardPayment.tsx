import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Divider,
  Button,
} from "@heroui/react";
import { clsx } from "clsx";

import { PosPayment } from "@/lib/types/pos";

interface KeyboardPaymentProps {
  payments: PosPayment[];
  grandTotal: number;
  onUpdatePayment: (id: string, updates: Partial<PosPayment>) => void;
  onRemovePayment: (id: string) => void;
  isFocused: boolean;
}

export const KeyboardPayment: React.FC<KeyboardPaymentProps> = ({
  payments,
  grandTotal,
  onUpdatePayment,
  onRemovePayment,
  isFocused,
}) => {
  const totalApplied = (payments || []).reduce(
    (sum, p) => sum + p.appliedAmount,
    0,
  );

  return (
    <div className="flex flex-col gap-3">
      {(payments || []).map((p) => (
        <div
          key={p.id}
          className={clsx(
            "flex flex-col gap-2 p-3 rounded-xl border-2 transition-all",
            isFocused ? "bg-white border-primary shadow-sm" : "bg-default-50 border-default-200",
          )}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-black uppercase tracking-wider text-primary">
              {p.isCash ? "Cash" : p.methodName}
            </span>
            <Button
              isIconOnly
              className="h-6 w-6 min-w-0"
              color="danger"
              size="sm"
              variant="flat"
              onPress={() => onRemovePayment(p.id)}
            >
              ✕
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            {/* Tendered Row */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] font-bold text-default-500 uppercase tracking-tight">
                Received
              </span>
              <Input
                className="w-28 font-mono"
                placeholder="0.00"
                size="sm"
                type="number"
                variant="bordered"
                value={p.tenderedAmount.toString()}
                onValueChange={(val) => {
                  const tAmount = parseFloat(val) || 0;
                  // For cash, applied is usually what's remaining up to the tendered amount
                  const applied = p.isCash
                    ? Math.min(
                        tAmount,
                        grandTotal - (totalApplied - p.appliedAmount),
                      )
                    : tAmount;

                  onUpdatePayment(p.id, {
                    tenderedAmount: tAmount,
                    appliedAmount: applied,
                    changeAmount: p.isCash ? Math.max(0, tAmount - applied) : 0,
                  });
                }}
              />
            </div>

            {/* Applied Row */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] font-bold text-default-500 uppercase tracking-tight">
                Applied
              </span>
              <Input
                className="w-28 font-mono"
                placeholder="0.00"
                size="sm"
                type="number"
                variant="bordered"
                value={p.appliedAmount.toString()}
                onValueChange={(val) => {
                  const aAmount = parseFloat(val) || 0;

                  onUpdatePayment(p.id, {
                    appliedAmount: aAmount,
                    changeAmount: p.isCash
                      ? Math.max(0, p.tenderedAmount - aAmount)
                      : 0,
                  });
                }}
              />
            </div>
          </div>

          {p.isCash && (
            <div className="flex justify-between items-center mt-1 pt-2 border-t border-dashed border-default-200">
              <span className="text-[10px] text-success font-black uppercase tracking-widest">
                Change
              </span>
              <span className="text-sm font-mono font-black text-success">
                ৳ {p.changeAmount.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      ))}
      {(payments || []).length === 0 && (
        <div className="py-8 text-center text-default-400 text-xs font-medium italic border-2 border-dashed border-default-200 rounded-xl">
          No payments added.
        </div>
      )}
    </div>
  );
};
