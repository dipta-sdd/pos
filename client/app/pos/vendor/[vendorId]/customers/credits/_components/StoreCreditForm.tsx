"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Input, Button, Select, SelectItem } from "@heroui/react";
import { useEffect, useState } from "react";

import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import { Customer } from "@/lib/types/general";

interface StoreCreditFormProps {
  initialData?: any;
  isEditing?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function StoreCreditForm({
  initialData,
  isEditing = false,
  onSuccess,
  onCancel,
}: StoreCreditFormProps) {
  const { vendor } = useVendor();
  const [customers, setCustomers] = useState<Customer[]>([]);

  const schema = z.object({
    customer_id: z.any(),
    current_balance: z.coerce.number().min(0, "Balance cannot be negative"),
    vendor_id: z.number(),
  });

  type FormData = {
    customer_id: number;
    current_balance: number;
    vendor_id: number;
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      customer_id: initialData?.customer_id,
      current_balance: initialData?.current_balance
        ? Number(initialData.current_balance)
        : 0,
      vendor_id: vendor?.id,
    },
  });

  useEffect(() => {
    if (vendor?.id) {
      fetchCustomers();
    }
  }, [vendor?.id]);

  const fetchCustomers = async () => {
    try {
      const response: any = await api.get(
        `/customers?vendor_id=${vendor?.id}&per_page=100`,
      );

      setCustomers(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch customers", error);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (isEditing && initialData?.id) {
        await api.put(`/customer-store-credits/${initialData.id}`, data);
        toast.success("Store credit updated successfully");
      } else {
        await api.post("/customer-store-credits", data);
        toast.success("Store credit issued successfully");
      }
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <form className="space-y-4 w-full" onSubmit={handleSubmit(onSubmit)}>
      <Select
        isRequired
        isDisabled={isEditing}
        label="Customer"
        selectedKeys={
          watch("customer_id") ? [String(watch("customer_id"))] : []
        }
        variant="bordered"
        onChange={(e) => setValue("customer_id", Number(e.target.value))}
      >
        {customers.map((c) => (
          <SelectItem
            key={c.id}
            textValue={c.name || `${c.first_name} ${c.last_name}`}
          >
            {c.name || `${c.first_name} ${c.last_name}`}
          </SelectItem>
        ))}
      </Select>

      <Input
        isRequired
        label="Balance"
        type="number"
        variant="bordered"
        {...register("current_balance")}
        errorMessage={errors.current_balance?.message}
        isInvalid={!!errors.current_balance}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button color="default" variant="flat" onPress={onCancel}>
          Cancel
        </Button>
        <Button color="primary" isLoading={isSubmitting} type="submit">
          {isEditing ? "Update Credit" : "Issue Credit"}
        </Button>
      </div>
    </form>
  );
}
