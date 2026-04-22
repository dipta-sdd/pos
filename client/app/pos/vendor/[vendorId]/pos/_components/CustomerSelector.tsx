"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Autocomplete,
  AutocompleteItem,
  Avatar,
  Button,
  Card,
  CardBody,
} from "@heroui/react";
import { User, Plus, X } from "lucide-react";

import { Customer } from "@/lib/types/general";
import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";

interface CustomerSelectorProps {
  selectedCustomer: Customer | null;
  onSelect: (customer: Customer | null) => void;
}

export default function CustomerSelector({
  selectedCustomer,
  onSelect,
}: CustomerSelectorProps) {
  const { vendor } = useVendor();
  const [items, setItems] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCustomers = useCallback(
    async (search = "") => {
      if (!vendor?.id) return;
      setLoading(true);
      try {
        const response: any = await api.get(`/customers`, {
          params: {
            vendor_id: vendor.id,
            search,
            per_page: 20,
          },
        });

        setItems(response.data.data);
      } catch (error) {
        console.error("Failed to fetch customers", error);
      } finally {
        setLoading(false);
      }
    },
    [vendor?.id],
  );

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  if (selectedCustomer) {
    return (
      <Card className="bg-primary-50 dark:bg-primary-900/20 border-none shadow-none">
        <CardBody className="p-2 flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar
              className="bg-primary text-white"
              icon={<User />}
              size="sm"
            />
            <div>
              <p className="text-xs font-bold text-primary">
                {selectedCustomer.name}
              </p>
              <p className="text-[10px] text-default-500">
                {selectedCustomer.phone || "No phone"}
              </p>
            </div>
          </div>
          <Button
            isIconOnly
            radius="full"
            size="sm"
            variant="light"
            onPress={() => onSelect(null)}
          >
            <X className="w-4 h-4 text-default-400" />
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="flex gap-2">
      <Autocomplete
        aria-label="Select Customer"
        isLoading={loading}
        items={items}
        placeholder="Search customer by name or phone..."
        size="sm"
        startContent={<User className="w-4 h-4 text-default-400" />}
        variant="bordered"
        onInputChange={(val) => fetchCustomers(val)}
        onSelectionChange={(id) => {
          const customer = items.find((c) => c.id === Number(id));

          if (customer) onSelect(customer);
        }}
      >
        {(customer) => (
          <AutocompleteItem key={customer.id} textValue={customer.name}>
            <div className="flex flex-col">
              <span className="text-small font-bold">{customer.name}</span>
              <span className="text-tiny text-default-400">
                {customer.phone}
              </span>
            </div>
          </AutocompleteItem>
        )}
      </Autocomplete>
      <Button isIconOnly color="primary" size="sm" variant="flat">
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
