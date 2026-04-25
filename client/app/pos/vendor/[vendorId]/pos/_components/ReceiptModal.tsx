"use client";

import React, { useRef, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Divider,
} from "@heroui/react";
import { Printer, X, Plus } from "lucide-react";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleData: any;
  receiptSettings: any;
  vendor: any;
  currencySymbol: string;
  autoPrint: boolean;
}

export default function ReceiptModal({
  isOpen,
  onClose,
  saleData,
  receiptSettings,
  vendor,
  currencySymbol,
  autoPrint,
}: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && autoPrint && saleData) {
      // Small delay for the modal to render before printing
      const timer = setTimeout(() => {
        handlePrint();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoPrint, saleData]);

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank", "width=320,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt #${saleData?.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              width: 80mm;
              padding: 4mm;
              color: #000;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 6px 0; }
            .row { display: flex; justify-content: space-between; margin: 2px 0; }
            .item-name { max-width: 60%; }
            .item-total { text-align: right; }
            .grand-total { font-size: 16px; font-weight: bold; }
            .small { font-size: 10px; color: #555; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 2px 0; vertical-align: top; }
            td:last-child { text-align: right; white-space: nowrap; }
            @media print {
              body { width: 80mm; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  if (!saleData) return null;

  const saleItems = saleData.sale_items || [];
  const salePayments = saleData.sale_payments || [];
  const customer = saleData.customer;
  const branch = saleData.branch;
  const salesPerson = saleData.sales_person;

  const formatAmount = (val: number | string) => {
    return `${currencySymbol}${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => { if (!open) onClose(); }}
      size="md"
      scrollBehavior="inside"
      classNames={{
        base: "bg-content1",
        header: "border-b border-default-100",
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex justify-between items-center gap-2">
              <div className="flex items-center gap-2">
                <Printer size={20} className="text-primary" />
                <span className="font-black uppercase tracking-wide">Receipt</span>
                <span className="text-default-400 text-sm font-mono">#{saleData.id}</span>
              </div>
            </ModalHeader>
            <ModalBody className="p-4">
              {/* Printable Receipt Content */}
              <div
                ref={receiptRef}
                className="bg-white text-black rounded-xl p-6 shadow-inner border border-default-200 font-mono text-[11px] leading-relaxed"
              >
                {/* Header */}
                <div className="text-center mb-3">
                  {receiptSettings?.show_logo && (
                    <div className="w-10 h-10 bg-gray-200 mx-auto mb-2 rounded-full flex items-center justify-center text-[8px] font-bold">
                      LOGO
                    </div>
                  )}
                  <div className="font-bold text-sm uppercase tracking-wider">
                    {vendor?.name || "STORE"}
                  </div>
                  {receiptSettings?.show_address && branch && (
                    <div className="text-[10px] text-gray-500">
                      {vendor?.address || branch?.address || ""}
                    </div>
                  )}
                  {receiptSettings?.show_contact_info && vendor?.phone && (
                    <div className="text-[10px] text-gray-500">
                      Tel: {vendor.phone}
                    </div>
                  )}
                </div>

                {/* Custom header text */}
                {receiptSettings?.header_text && (
                  <div className="text-center text-[10px] italic text-gray-500 mb-2">
                    {receiptSettings.header_text}
                  </div>
                )}

                <div className="divider border-t border-dashed border-gray-400 my-2" />

                {/* Sale Info */}
                <div className="flex justify-between text-[10px] text-gray-500 mb-2">
                  <span>Sale #{saleData.id}</span>
                  <span>{new Date(saleData.created_at).toLocaleString()}</span>
                </div>
                {customer && (
                  <div className="text-[10px] text-gray-500 mb-1">
                    Customer: {customer.name}
                  </div>
                )}
                {salesPerson && (
                  <div className="text-[10px] text-gray-500 mb-1">
                    Cashier: {salesPerson.name}
                  </div>
                )}

                <div className="divider border-t border-dashed border-gray-400 my-2" />

                {/* Items */}
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] text-gray-500 border-b border-gray-200">
                      <td className="pb-1 font-bold">Item</td>
                      <td className="pb-1 font-bold text-center">Qty</td>
                      <td className="pb-1 font-bold" style={{ textAlign: "right" }}>Total</td>
                    </tr>
                  </thead>
                  <tbody>
                    {saleItems.map((item: any, idx: number) => {
                      const productName = item.variant?.product?.name || "Item";
                      const variantLabel =
                        item.variant?.name === "Standard" && item.variant?.value === "Default"
                          ? ""
                          : ` (${item.variant?.name}: ${item.variant?.value})`;
                      return (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-1">
                            <div className="font-bold text-[11px]">{productName}</div>
                            {variantLabel && (
                              <div className="text-[9px] text-gray-400">{variantLabel}</div>
                            )}
                            <div className="text-[9px] text-gray-400">
                              {formatAmount(item.sell_price_at_sale)} × {Number(item.quantity)}
                            </div>
                          </td>
                          <td className="py-1 text-center">{Number(item.quantity)}</td>
                          <td className="py-1 font-bold" style={{ textAlign: "right" }}>
                            {formatAmount(item.line_total)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="divider border-t border-dashed border-gray-400 my-2" />

                {/* Totals */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatAmount(saleData.subtotal_amount)}</span>
                  </div>
                  {Number(saleData.total_discount_amount) > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount</span>
                      <span>-{formatAmount(saleData.total_discount_amount)}</span>
                    </div>
                  )}
                  {Number(saleData.tax_amount) > 0 && (
                    <div className="flex justify-between">
                      <span>VAT</span>
                      <span>{formatAmount(saleData.tax_amount)}</span>
                    </div>
                  )}
                  <div className="divider border-t border-gray-300 my-1" />
                  <div className="flex justify-between font-bold text-sm">
                    <span>TOTAL</span>
                    <span>{formatAmount(saleData.final_amount)}</span>
                  </div>
                </div>

                <div className="divider border-t border-dashed border-gray-400 my-2" />

                {/* Payments */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase text-gray-500 mb-1">Payment(s)</div>
                  {salePayments.map((p: any, idx: number) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between">
                        <span>{p.payment_method?.name || "Payment"}</span>
                        <span>{formatAmount(p.amount)}</span>
                      </div>
                      {Number(p.amount_received) > 0 && Number(p.amount_received) !== Number(p.amount) && (
                        <div className="flex justify-between text-[10px] text-gray-400">
                          <span>Received</span>
                          <span>{formatAmount(p.amount_received)}</span>
                        </div>
                      )}
                      {Number(p.change) > 0 && (
                        <div className="flex justify-between text-[10px] text-gray-400">
                          <span>Change</span>
                          <span>{formatAmount(p.change)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="divider border-t border-dashed border-gray-400 my-2" />

                {/* Custom footer text */}
                {receiptSettings?.footer_text && (
                  <div className="text-center text-[10px] italic text-gray-500 mb-2">
                    {receiptSettings.footer_text}
                  </div>
                )}

                {/* Footer */}
                <div className="text-center text-[9px] text-gray-400 mt-2">
                  <div>Thank you for your purchase!</div>
                  <div className="mt-1">{new Date(saleData.created_at).toLocaleString()}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4 pb-2">
                <Button
                  className="flex-1 font-black uppercase tracking-widest"
                  color="primary"
                  size="lg"
                  startContent={<Printer size={18} />}
                  onPress={handlePrint}
                >
                  Print Receipt
                </Button>
                <Button
                  className="flex-1 font-black uppercase tracking-widest"
                  color="success"
                  size="lg"
                  variant="flat"
                  startContent={<Plus size={18} />}
                  onPress={onClose}
                >
                  New Sale
                </Button>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
