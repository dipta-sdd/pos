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
import { Card, CardBody } from "@heroui/card";
import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import { ProductImage } from "@/components/ui/CustomTable";

interface NewInventoryModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onSelect: (item: any) => void;
}

export default function NewInventoryModal({
  isOpen,
  onOpenChange,
  onSelect,
}: NewInventoryModalProps) {
  const { vendor } = useVendor();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search.length >= 2) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleSearch = async () => {
    if (!vendor?.id) return;
    setLoading(true);
    try {
      const response: any = await api.get(`/branch-products`, {
        params: {
          vendor_id: vendor.id,
          search: search,
          per_page: 5,
        },
      });

      setResults(response?.data?.data || []);
    } catch (error) {
      toast.error("Failed to search products");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    const currentPath = window.location.pathname;

    router.push(
      `/pos/vendor/${vendor?.id}/products/new?redirect_to=${currentPath}`,
    );
    onOpenChange();
  };

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      size="2xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Add New Inventory
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Search Product or SKU"
                  placeholder="Type to search..."
                  startContent={
                    <Search className="text-default-400" size={20} />
                  }
                  value={search}
                  onValueChange={setSearch}
                />

                <div className="space-y-2">
                  {loading ? (
                    <p className="text-center text-default-400 py-4">
                      Searching...
                    </p>
                  ) : results.length > 0 ? (
                    results.map((item) => (
                      <Card
                        key={item.id}
                        isPressable
                        className="w-full border border-default-200"
                        onPress={() => {
                          onSelect(item);
                          onClose();
                        }}
                      >
                        <CardBody className="flex flex-row items-center gap-4 p-3">
                          <ProductImage
                            alt={item.product_name}
                            image_url={item.image_url}
                          />
                          <div className="flex-grow text-left">
                            <p className="font-semibold">{item.product_name}</p>
                            <p className="text-sm text-default-500">
                              {item.variant_value} • SKU: {item.sku || "N/A"}
                            </p>
                          </div>
                          <Plus className="text-primary" size={20} />
                        </CardBody>
                      </Card>
                    ))
                  ) : search.length >= 2 ? (
                    <p className="text-center text-default-400 py-4">
                      No products found
                    </p>
                  ) : (
                    <p className="text-center text-default-400 py-4 italic">
                      Start typing to search for products in your catalog
                    </p>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="justify-between border-t border-default-100">
              <div className="flex items-center gap-2">
                <p className="text-sm text-default-500">
                  Don&apos;t see your product?
                </p>
                <Button
                  color="primary"
                  size="sm"
                  variant="flat"
                  onPress={handleCreateNew}
                >
                  Create New Product
                </Button>
              </div>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
