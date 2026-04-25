"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Divider,
} from "@heroui/react";
import { Printer, CreditCard, ShoppingCart } from "lucide-react";

import { Sale } from "@/lib/types/general";
import { formatDateTime } from "@/lib/helper/dates";

interface SaleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  currencySymbol?: string;
  onPrintReceipt?: (sale: Sale) => void;
  onVoid?: (sale: Sale) => void;
}

export default function SaleDetailModal({
  isOpen,
  onClose,
  sale,
  currencySymbol = "৳",
  onPrintReceipt,
  onVoid,
}: SaleDetailModalProps) {
  if (!sale) return null;

  const fmt = (val: string | number) =>
    `${currencySymbol}${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  const statusColor: Record<
    string,
    "success" | "danger" | "warning" | "default"
  > = {
    completed: "success",
    voided: "danger",
    refunded: "warning",
  };

  const items = sale.sale_items || [];
  const payments = sale.sale_payments || [];

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      size="2xl"
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex items-center gap-3 border-b border-default-100">
              <ShoppingCart className="text-primary" size={20} />
              <div className="flex-1">
                <span className="font-black uppercase tracking-wide">
                  Sale #{sale.id}
                </span>
                <span className="ml-2 text-default-400 text-sm">
                  {formatDateTime(sale.created_at)}
                </span>
              </div>
              <Chip
                className="font-bold uppercase"
                color={statusColor[sale.status] || "default"}
                size="sm"
                variant="flat"
              >
                {sale.status}
              </Chip>
            </ModalHeader>
            <ModalBody className="p-6 space-y-6">
              {/* Meta info row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-default-400 font-bold mb-1">
                    Branch
                  </p>
                  <p className="font-semibold">{sale.branch?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-default-400 font-bold mb-1">
                    Salesperson
                  </p>
                  <p className="font-semibold">
                    {sale.sales_person?.name || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-default-400 font-bold mb-1">
                    Customer
                  </p>
                  <p className="font-semibold">
                    {sale.customer?.name || sale.customer
                      ? `${sale.customer?.first_name || ""} ${sale.customer?.last_name || ""}`.trim() ||
                        sale.customer?.name
                      : "Walk-in"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-default-400 font-bold mb-1">
                    Session
                  </p>
                  <p className="font-semibold">
                    #{sale.cash_register_session_id || "—"}
                  </p>
                </div>
              </div>

              <Divider />

              {/* Items Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-default-400 mb-3">
                  Items ({items.length})
                </h4>
                <div className="bg-default-50 dark:bg-white/5 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-default-200 text-default-500 text-xs uppercase tracking-wider">
                        <th className="text-left px-4 py-2">Product</th>
                        <th className="text-center px-2 py-2">Qty</th>
                        <th className="text-right px-2 py-2">Price</th>
                        <th className="text-right px-2 py-2">Discount</th>
                        <th className="text-right px-2 py-2">Tax</th>
                        <th className="text-right px-4 py-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => {
                        const productName =
                          item.variant?.product?.name || "Item";
                        const variantLabel =
                          item.variant?.name === "Standard" &&
                          item.variant?.value === "Default"
                            ? ""
                            : item.variant?.name
                              ? `${item.variant.name}: ${item.variant.value}`
                              : "";

                        return (
                          <tr
                            key={idx}
                            className="border-b border-default-100 last:border-b-0"
                          >
                            <td className="px-4 py-2.5">
                              <p className="font-semibold">{productName}</p>
                              {variantLabel && (
                                <p className="text-[10px] text-default-400">
                                  {variantLabel}
                                </p>
                              )}
                            </td>
                            <td className="text-center px-2 py-2.5">
                              {Number(item.quantity)}
                            </td>
                            <td className="text-right px-2 py-2.5">
                              {fmt(item.sell_price_at_sale)}
                            </td>
                            <td className="text-right px-2 py-2.5 text-danger">
                              {Number(item.discount_amount) > 0
                                ? `-${fmt(item.discount_amount)}`
                                : "—"}
                            </td>
                            <td className="text-right px-2 py-2.5">
                              {Number(item.tax_amount) > 0
                                ? fmt(item.tax_amount)
                                : "—"}
                            </td>
                            <td className="text-right px-4 py-2.5 font-bold">
                              {fmt(item.line_total)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <Divider />

              {/* Totals */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-default-400 mb-2">
                    <CreditCard className="inline mr-1" size={14} /> Payments (
                    {payments.length})
                  </h4>
                  {payments.map((p, idx) => (
                    <div
                      key={idx}
                      className="bg-default-50 dark:bg-white/5 rounded-lg p-3"
                    >
                      <div className="flex justify-between">
                        <span className="font-semibold text-sm">
                          {p.payment_method?.name || "Payment"}
                        </span>
                        <span className="font-bold text-sm">
                          {fmt(p.amount)}
                        </span>
                      </div>
                      {Number(p.amount_received || 0) > 0 &&
                        Number(p.amount_received) !== Number(p.amount) && (
                          <div className="flex justify-between text-xs text-default-400 mt-1">
                            <span>Received</span>
                            <span>{fmt(p.amount_received!)}</span>
                          </div>
                        )}
                      {Number(p.change || 0) > 0 && (
                        <div className="flex justify-between text-xs text-default-400">
                          <span>Change</span>
                          <span>{fmt(p.change!)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-2 text-sm">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-default-400 mb-2">
                    Summary
                  </h4>
                  <div className="bg-default-50 dark:bg-white/5 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-default-500">Subtotal</span>
                      <span>{fmt(sale.subtotal_amount)}</span>
                    </div>
                    {Number(sale.total_discount_amount) > 0 && (
                      <div className="flex justify-between text-danger">
                        <span>Discount</span>
                        <span>-{fmt(sale.total_discount_amount)}</span>
                      </div>
                    )}
                    {Number(sale.tax_amount) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-default-500">Tax</span>
                        <span>{fmt(sale.tax_amount)}</span>
                      </div>
                    )}
                    <Divider />
                    <div className="flex justify-between text-lg font-black">
                      <span>TOTAL</span>
                      <span>{fmt(sale.final_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="border-t border-default-100 justify-between">
              <div>
                {onVoid && sale.status !== "voided" && (
                  <Button
                    className="font-bold"
                    color="danger"
                    variant="flat"
                    onPress={() => onVoid(sale)}
                  >
                    Void Sale
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {onPrintReceipt && (
                  <Button
                    className="font-bold"
                    color="primary"
                    startContent={<Printer size={16} />}
                    variant="flat"
                    onPress={() => onPrintReceipt(sale)}
                  >
                    Re-print Receipt
                  </Button>
                )}
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
