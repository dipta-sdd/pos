import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { toast } from "sonner";

import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";

interface AddStockModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  item: {
    id: number;
    product_id: number;
    product_name: string;
    variant_value: string;
  };
  onSuccess: () => void;
}

export default function AddStockModal({
  isOpen,
  onOpenChange,
  item,
  onSuccess,
}: AddStockModalProps) {
  const { membership, selectedBranchIds } = useVendor();
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [quantity, setQuantity] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [loading, setLoading] = useState(false);
  const branches =
    membership?.user_branch_assignments?.map((a) => a.branch) || [];

  useEffect(() => {
    if (isOpen) {
      if (selectedBranchIds.length === 1) {
        setSelectedBranchId(selectedBranchIds[0]);
      } else if (branches.length === 1) {
        setSelectedBranchId(String(branches[0].id));
      } else {
        setSelectedBranchId("");
      }
    }
  }, [isOpen, selectedBranchIds, branches]);

  const handleSubmit = async () => {
    if (!selectedBranchId) {
      toast.error("Please select a branch");

      return;
    }
    if (!quantity) {
      toast.error("Quantity is required");

      return;
    }
    setLoading(true);
    try {
      await api.post(`/branch-products/add-stock`, {
        branch_id: Number(selectedBranchId),
        product_id: item.product_id,
        variant_id: item.id,
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
      toast.error(error.response?.data?.message || "Failed to add stock");
    } finally {
      setLoading(false);
    }
  };

  const showBranchSelection =
    branches.length > 1 && selectedBranchIds.length !== 1;

  return (
    <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Add Stock - {item.product_name} ({item.variant_value})
            </ModalHeader>
            <ModalBody>
              {showBranchSelection && (
                <Select
                  isRequired
                  label="Select Branch"
                  placeholder="Choose a branch"
                  selectedKeys={selectedBranchId ? [selectedBranchId] : []}
                  onSelectionChange={(keys) =>
                    setSelectedBranchId(Array.from(keys)[0] as string)
                  }
                >
                  {branches.map((branch) => (
                    <SelectItem key={String(branch.id)}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </Select>
              )}
              <Input
                isRequired
                label="Quantity"
                placeholder="0.00"
                type="number"
                value={quantity}
                onValueChange={setQuantity}
              />
              <Input
                label="Cost Price"
                placeholder="0.00"
                type="number"
                value={costPrice}
                onValueChange={setCostPrice}
              />
              <Input
                label="Selling Price"
                placeholder="0.00"
                type="number"
                value={sellingPrice}
                onValueChange={setSellingPrice}
              />
              <Input
                label="Expiry Date"
                placeholder="YYYY-MM-DD"
                type="date"
                value={expiryDate}
                onValueChange={setExpiryDate}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose}>
                Close
              </Button>
              <Button
                color="primary"
                isLoading={loading}
                onPress={handleSubmit}
              >
                Add Stock
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
