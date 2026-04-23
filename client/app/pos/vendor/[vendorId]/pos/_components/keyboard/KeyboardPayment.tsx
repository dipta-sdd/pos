import React from "react";
import { MoreVertical } from "lucide-react";
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Divider,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
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
  const totalAppliedWithoutCurrent = (currentId: string) =>
    (payments || [])
      .filter((p) => p.id !== currentId)
      .reduce((sum, p) => sum + p.appliedAmount, 0);

  return (
    <div className="flex flex-col gap-2">
      {(payments || []).map((p) => {
        const remainingForThis = Math.max(
          0,
          grandTotal - totalAppliedWithoutCurrent(p.id),
        );

        return (
          <div
            key={p.id}
            className={clsx(
              "flex flex-col gap-1 p-2 transition-all",
              !p.isCash && "rounded-xl",
              p.isCash && "bg-transparent border-b border-default-100 pb-2",
            )}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-wider text-primary">
                {p.isCash ? "Cash Payment" : p.methodName}
              </span>
              <div className="flex items-center gap-1">
                {p.isCash ? (
                  <Dropdown size="sm">
                    <DropdownTrigger>
                      <Button
                        isIconOnly
                        className="h-6 w-6 min-w-0"
                        size="sm"
                        variant="light"
                      >
                        <MoreVertical size={14} />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Payment Actions"
                      onAction={(key) => {
                        if (key === "toggle_manual") {
                          onUpdatePayment(p.id, {
                            isManualApplied: !p.isManualApplied,
                          });
                        }
                        if (key === "remove") {
                          onRemovePayment(p.id);
                        }
                      }}
                    >
                      <DropdownItem key="toggle_manual">
                        {p.isManualApplied
                          ? "Switch to Auto Applied"
                          : "Manual Applied Amount"}
                      </DropdownItem>
                      <DropdownItem
                        key="remove"
                        className="text-danger"
                        color="danger"
                      >
                        Remove Payment
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                ) : (
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
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              {/* Received Row */}
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
                    let applied = p.appliedAmount;

                    if (!p.isManualApplied) {
                      applied = Math.min(tAmount, remainingForThis);
                    }

                    onUpdatePayment(p.id, {
                      tenderedAmount: tAmount,
                      appliedAmount: applied,
                      changeAmount: p.isCash
                        ? Math.max(0, tAmount - applied)
                        : 0,
                    });
                  }}
                />
              </div>

              {/* Applied Row - Only if manual cash */}
              {p.isManualApplied && (
                <div className="flex items-center justify-between gap-4 border-t border-default-100 pt-2">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-tight">
                    Applied (Manual)
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
              )}

              {/* Reference Row - Only for non-cash */}
              {!p.isCash && (
                <div className="flex items-center justify-between gap-4 border-t border-default-100 pt-2">
                  <span className="text-[10px] font-bold text-default-500 uppercase tracking-tight">
                    Reference
                  </span>
                  <Input
                    className="w-28"
                    placeholder="Ref #"
                    size="sm"
                    variant="bordered"
                    value={p.reference || ""}
                    onValueChange={(val) => {
                      onUpdatePayment(p.id, {
                        reference: val,
                      });
                    }}
                  />
                </div>
              )}
            </div>

            {p.isCash && (
              <div className="flex justify-between items-center mt-0 ">
                <span className="text-[10px] text-success font-black uppercase tracking-widest">
                  Change
                </span>
                <span className="text-sm font-mono font-black text-success">
                  ৳ {p.changeAmount.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        );
      })}
      {(payments || []).length === 0 && (
        <div className="py-4 text-center text-default-400 text-[10px] font-medium italic border-2 border-dashed border-default-200 rounded-lg">
          No payments added.
        </div>
      )}
    </div>
  );
};
