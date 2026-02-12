"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Input, Button, Select, SelectItem, Textarea } from "@heroui/react";
import { useEffect, useState } from "react";

import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import { Variant } from "@/lib/types/general";

interface InventoryAdjustmentFormProps {
  initialData?: any;
  isEditing?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function InventoryAdjustmentForm({
  initialData,
  isEditing = false,
  onSuccess,
  onCancel,
}: InventoryAdjustmentFormProps) {
  const { vendor } = useVendor();
  const [variants, setVariants] = useState<Variant[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  const schema = z.object({
    variant_id: z.any(),
    branch_id: z.number().min(1, "Branch is required"),
    quantity: z.coerce.number().min(0.01, "Quantity must be positive"),
    type: z.enum(["addition", "subtraction"]),
    reason: z.string().min(1, "Reason is required"),
    vendor_id: z.number(),
  });

  type FormData = {
    variant_id: number;
    branch_id: number;
    quantity: number;
    type: "addition" | "subtraction";
    reason: string;
    vendor_id: number;
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      variant_id: initialData?.variant_id,
      branch_id: initialData?.branch_id || undefined,
      quantity: initialData?.quantity || 1,
      type: initialData?.type || "addition",
      reason: initialData?.reason || "",
      vendor_id: vendor?.id,
    },
  });

  useEffect(() => {
    if (vendor?.id) {
      fetchVariants();
      fetchBranches();
    }
  }, [vendor?.id]);

  const fetchVariants = async () => {
    try {
      const response: any = await api.get(
        `/variants?vendor_id=${vendor?.id}&per_page=1000`,
      );

      setVariants(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch variants", error);
    }
  };

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
        await api.put(`/inventory-adjustments/${initialData.id}`, data);
        toast.success("Adjustment updated successfully");
      } else {
        await api.post("/inventory-adjustments", {
          ...data,
          vendor_id: vendor?.id,
        });
        toast.success("Adjustment recorded successfully");
      }
      if (onSuccess) onSuccess();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        Object.entries(error.response?.data?.errors).forEach(([key, value]) => {
          setError(key as any, {
            type: "manual",
            message: (value as string[])[0],
          });
        });
      }
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <form className="space-y-4 w-full" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          isRequired
          errorMessage={errors.branch_id?.message}
          isInvalid={!!errors.branch_id}
          label="Branch"
          placeholder="Select branch"
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

        <Select
          isRequired
          errorMessage={errors.variant_id?.message}
          isInvalid={!!errors.variant_id}
          label="Product Variant"
          placeholder="Select variant"
          selectedKeys={
            watch("variant_id") ? [String(watch("variant_id"))] : []
          }
          variant="bordered"
          onChange={(e) => setValue("variant_id", Number(e.target.value))}
        >
          {variants.map((v) => (
            <SelectItem key={v.id} textValue={`${v.product?.name} - ${v.name}`}>
              {v.product?.name} - {v.name} ({v.sku})
            </SelectItem>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          isRequired
          label="Adjustment Type"
          selectedKeys={[watch("type")]}
          variant="bordered"
          onChange={(e) => setValue("type", e.target.value as any)}
        >
          <SelectItem key="addition" textValue="Addition (+)">
            Addition (+)
          </SelectItem>
          <SelectItem key="subtraction" textValue="Subtraction (-)">
            Subtraction (-)
          </SelectItem>
        </Select>

        <Input
          isRequired
          label="Quantity"
          type="number"
          variant="bordered"
          {...register("quantity")}
          errorMessage={errors.quantity?.message}
          isInvalid={!!errors.quantity}
        />
      </div>

      <Textarea
        isRequired
        label="Reason"
        placeholder="e.g. Damaged stock, Inventory count correction"
        variant="bordered"
        {...register("reason")}
        errorMessage={errors.reason?.message}
        isInvalid={!!errors.reason}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button color="default" variant="flat" onPress={onCancel}>
          Cancel
        </Button>
        <Button color="primary" isLoading={isSubmitting} type="submit">
          {isEditing ? "Update Adjustment" : "Record Adjustment"}
        </Button>
      </div>
    </form>
  );
}
