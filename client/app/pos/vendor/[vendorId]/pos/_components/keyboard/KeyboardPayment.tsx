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
  const totalApplied = (payments || []).reduce((sum, p) => sum + p.appliedAmount, 0);
  const totalChange = (payments || []).reduce((sum, p) => sum + p.changeAmount, 0);
  const remaining = Math.max(0, grandTotal - totalApplied);

  return (
    <Card
      className={clsx(
        "border-2 transition-all",
        isFocused ? "border-primary" : "border-transparent",
      )}
      shadow="sm"
    >
      <CardHeader className="pb-0 px-4 pt-4 flex-col items-start">
        <p className="text-tiny uppercase font-bold text-default-500 tracking-wider">
          Payments [F8]
        </p>
      </CardHeader>
      <CardBody className="gap-4">
        <div className="flex flex-col gap-3">
          {payments.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-2 p-2 rounded-lg bg-default-50 border border-default-100"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-primary">
                  {p.methodName}
                </span>
                <Button
                  isIconOnly
                  color="danger"
                  size="sm"
                  variant="light"
                  onPress={() => onRemovePayment(p.id)}
                >
                  ✕
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  className="font-mono"
                  label="Tendered"
                  labelPlacement="outside"
                  placeholder="0.00"
                  size="sm"
                  type="number"
                  value={p.tenderedAmount.toString()}
                  onValueChange={(val) => {
                    const tAmount = parseFloat(val) || 0;
                    const applied = p.isCash
                      ? Math.min(
                          tAmount,
                          grandTotal - (totalApplied - p.appliedAmount),
                        )
                      : tAmount;

                    onUpdatePayment(p.id, {
                      tenderedAmount: tAmount,
                      appliedAmount: applied,
                      changeAmount: p.isCash
                        ? Math.max(0, tAmount - applied)
                        : 0,
                    });
                  }}
                />
                <Input
                  className="font-mono"
                  label="Applied"
                  labelPlacement="outside"
                  placeholder="0.00"
                  size="sm"
                  type="number"
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
              {p.isCash && p.changeAmount > 0 && (
                <div className="flex justify-between items-center mt-1 px-1">
                  <span className="text-[10px] text-success font-bold uppercase">
                    Change to return:
                  </span>
                  <span className="text-sm font-mono font-bold text-success">
                    ${p.changeAmount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          ))}
          {(payments || []).length === 0 && (
            <div className="py-6 text-center text-default-400 text-sm italic">
              No payments added. Press [Alt+1] for Cash.
            </div>
          )}
        </div>

        <Divider />

        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm px-1">
            <span className="text-default-500">Total Change:</span>
            <span className="font-mono font-bold text-success">
              ${totalChange.toLocaleString()}
            </span>
          </div>
          <div
            className={clsx(
              "flex justify-between items-center p-3 rounded-xl border-2 transition-colors",
              remaining > 0
                ? "bg-danger-50 border-danger-200"
                : "bg-success-50 border-success-200",
            )}
          >
            <span className="text-xs font-black uppercase text-default-600">
              Remaining
            </span>
            <span
              className={clsx(
                "text-2xl font-mono font-black",
                remaining > 0 ? "text-danger" : "text-success",
              )}
            >
              ${remaining.toLocaleString()}
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
