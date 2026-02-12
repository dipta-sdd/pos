"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Input, Button, Select, SelectItem } from "@heroui/react";
import { useEffect, useState } from "react";

import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import { BillingCounter, Branch } from "@/lib/types/general";

interface BillingCounterFormProps {
  initialData?: BillingCounter | null;
  isEditing?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function BillingCounterForm({
  initialData,
  isEditing = false,
  onSuccess,
  onCancel,
}: BillingCounterFormProps) {
  const { vendor } = useVendor();
  const [branches, setBranches] = useState<Branch[]>([]);

  const schema = z.object({
    name: z.string().min(1, "Name is required"),
    branch_id: z.any(),
  });

  type FormData = {
    name: string;
    branch_id: number;
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
      name: initialData?.name || "",
      branch_id: initialData?.branch_id,
    },
  });

  useEffect(() => {
    if (vendor?.id) {
      fetchBranches();
    }
  }, [vendor?.id]);

  const fetchBranches = async () => {
    try {
      const response: any = await api.get(
        `/branches?vendor_id=${vendor?.id}&per_page=100`,
      );

      setBranches(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch branches", error);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (isEditing && initialData?.id) {
        await api.put(`/billing-counters/${initialData.id}`, data);
        toast.success("Counter updated successfully");
      } else {
        await api.post("/billing-counters", data);
        toast.success("Counter created successfully");
      }
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <form className="space-y-4 w-full" onSubmit={handleSubmit(onSubmit)}>
      <Input
        isRequired
        label="Counter Name"
        placeholder="e.g. Counter 1"
        variant="bordered"
        {...register("name")}
        errorMessage={errors.name?.message}
        isInvalid={!!errors.name}
      />

      <Select
        isRequired
        label="Branch"
        selectedKeys={watch("branch_id") ? [String(watch("branch_id"))] : []}
        variant="bordered"
        onChange={(e) => setValue("branch_id", Number(e.target.value))}
      >
        {branches.map((b) => (
          <SelectItem key={b.id} textValue={b.name}>
            {b.name}
          </SelectItem>
        ))}
      </Select>

      <div className="flex justify-end gap-3 pt-4">
        <Button color="default" variant="flat" onPress={onCancel}>
          Cancel
        </Button>
        <Button color="primary" isLoading={isSubmitting} type="submit">
          {isEditing ? "Update Counter" : "Create Counter"}
        </Button>
      </div>
    </form>
  );
}
