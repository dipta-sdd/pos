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
  vendorId: string | number;
  branchId: string | number;
  item: StockTransferItem | null;
  itemIndex: number | null;
  onConfirm: (
    index: number,
    stock: StockBatch,
    approvedQuantity: number,
  ) => void;
}

export default function StockSelectionModal({
  isOpen,
  onClose,
  vendorId,
  branchId,
  item,
  itemIndex,
  onConfirm,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [stocks, setStocks] = useState<StockBatch[]>([]);
  const [selectedStockId, setSelectedStockId] = useState<string>("");

  useEffect(() => {
    if (isOpen && item && item.variant_id) {
      fetchStocks();
    }
  }, [isOpen, item]);

  const fetchStocks = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(
        `/api/vendor/${vendorId}/branch-products/stocks`,
        {
          params: {
            variant_id: item?.variant_id,
            "branch_ids[]": branchId,
          },
        },
      );
      const data = response.data;

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
    if (!selectedStockId || itemIndex === null || !item) {
      toast.error("Please select a stock batch");

      return;
    }
    const selectedStock = stocks.find(
      (s) => s.id.toString() === selectedStockId,
    );

    if (!selectedStock) return;

    if (Number(selectedStock.quantity) < Number(item.quantity)) {
      toast.warning(
        `Selected batch only has ${selectedStock.quantity} in stock. Adjusting approved quantity.`,
      );
    }

    const approvedQuantity = Math.min(
      Number(selectedStock.quantity),
      Number(item.quantity),
    );

    onConfirm(itemIndex, selectedStock, approvedQuantity);
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
                <strong className="text-foreground">{item?.quantity}</strong>.
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
                          className={`font-bold ${Number(stock.quantity) >= Number(item?.quantity) ? "text-success" : "text-warning"}`}
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
