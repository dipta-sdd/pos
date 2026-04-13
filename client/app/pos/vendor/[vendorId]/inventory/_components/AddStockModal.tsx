import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import api from "@/lib/api";
import { toast } from "sonner"; 

interface AddStockModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  branchProductId: number;
  onSuccess: () => void;
}

export default function AddStockModal({
  isOpen,
  onOpenChange,
  branchProductId,
  onSuccess,
}: AddStockModalProps) {
  const [quantity, setQuantity] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!quantity) {
      toast.error("Quantity is required");
      return;
    }
    setLoading(true);
    try {
      await api.post(`/branch-products/add-stock`, {
        branch_product_id: branchProductId,
        quantity: Number(quantity),
        cost_price: costPrice ? Number(costPrice) : undefined,
        selling_price: sellingPrice ? Number(sellingPrice) : undefined,
        expiry_date: expiryDate || undefined,
      });
      toast.success("Stock added successfully");
      onSuccess();
      onOpenChange();
      // reset form
      setQuantity("");
      setCostPrice("");
      setSellingPrice("");
      setExpiryDate("");
    } catch (error: any) {
      console.error("Failed to add stock", error);
      toast.error(error.response?.data?.message || "Failed to add stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Add Stock
            </ModalHeader>
            <ModalBody>
              <Input
                label="Quantity"
                type="number"
                placeholder="0.00"
                value={quantity}
                onValueChange={setQuantity}
                isRequired
              />
              <Input
                label="Cost Price"
                type="number"
                placeholder="0.00"
                value={costPrice}
                onValueChange={setCostPrice}
              />
              <Input
                label="Selling Price"
                type="number"
                placeholder="0.00"
                value={sellingPrice}
                onValueChange={setSellingPrice}
              />
              <Input
                label="Expiry Date"
                type="date"
                placeholder="YYYY-MM-DD"
                value={expiryDate}
                onValueChange={setExpiryDate}
                InputLabelProps={{ shrink: true }}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={handleSubmit} isLoading={loading}>
                Add Stock
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
