"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
  RadioGroup,
  Radio,
} from "@heroui/react";
import { toast } from "sonner";

import { StockTransferItem } from "@/lib/types/general";
import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";

interface StockBatch {
  id: number;
  branch_id: number;
  product_id: number;
  variant_id: number;
  quantity: number;
  cost_price: string;
  selling_price: string;
  expiry_date: string | null;
  unit_of_measure_abbreviation: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  branchId: string | number;
  variantId: number;
  requestedQuantity: number;
  onConfirm: (stock: StockBatch, approvedQuantity: number) => void;
}

export default function StockSelectionModal({
  isOpen,
  onClose,
  branchId,
  variantId,
  requestedQuantity,
  onConfirm,
}: Props) {
  const { vendor } = useVendor();
  const vendorId = vendor?.id;
  const [isLoading, setIsLoading] = useState(false);
  const [stocks, setStocks] = useState<StockBatch[]>([]);
  const [selectedStockId, setSelectedStockId] = useState<string>("");

  useEffect(() => {
    if (isOpen && variantId) {
      fetchStocks();
    }
  }, [isOpen, variantId]);

  const fetchStocks = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(
        `/api/vendor/${vendorId}/branch-products/stocks`,
        {
          params: {
            variant_id: variantId,
            "branch_ids[]": branchId,
          },
        },
      );
      const data = response.data as StockBatch[];

      setStocks(data);
      if (data.length > 0) {
        setSelectedStockId(data[0].id.toString());
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch stock batches");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedStockId || !variantId) {
      toast.error("Please select a stock batch");

      return;
    }
    const selectedStock = stocks.find(
      (s) => s.id.toString() === selectedStockId,
    );

    if (!selectedStock) return;

    if (Number(selectedStock.quantity) < Number(requestedQuantity)) {
      toast.warning(
        `Selected batch only has ${selectedStock.quantity} in stock. Adjusting approved quantity.`,
      );
    }

    const approvedQuantity = Math.min(
      Number(selectedStock.quantity),
      Number(requestedQuantity),
    );

    onConfirm(selectedStock, approvedQuantity);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} size="2xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader>Select Stock Batch</ModalHeader>
        <ModalBody>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Spinner />
            </div>
          ) : stocks.length === 0 ? (
            <div className="text-center p-8 text-default-500">
              No stock batches found for this product.
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-default-500">
                Please select which stock batch to fulfill this request from.
                The requested quantity is{" "}
                <strong className="text-foreground">{requestedQuantity}</strong>.
              </p>
              <RadioGroup
                value={selectedStockId}
                onValueChange={setSelectedStockId}
              >
                <div className="grid grid-cols-1 gap-4">
                  {stocks.map((stock) => (
                    <Radio
                      key={stock.id}
                      description={`Cost: $${stock.cost_price} | Selling: $${stock.selling_price}`}
                      value={stock.id.toString()}
                    >
                      <div className="flex justify-between items-center w-full min-w-[300px]">
                        <span>
                          Batch ID: #{stock.id}{" "}
                          {stock.expiry_date
                            ? `(Exp: ${stock.expiry_date})`
                            : ""}
                        </span>
                        <span
                          className={`font-bold ${Number(stock.quantity) >= Number(requestedQuantity) ? "text-success" : "text-warning"}`}
                        >
                          {stock.quantity} available
                        </span>
                      </div>
                    </Radio>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            isDisabled={!selectedStockId || stocks.length === 0}
            onPress={handleConfirm}
          >
            Confirm Selection
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
