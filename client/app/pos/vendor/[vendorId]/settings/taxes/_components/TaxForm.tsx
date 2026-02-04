"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Input, Button, Switch } from "@heroui/react";

import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import { Tax } from "@/lib/types/general";

interface TaxFormProps {
  initialData?: Tax | null;
  isEditing?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TaxForm({
  initialData,
  isEditing = false,
  onSuccess,
  onCancel,
}: TaxFormProps) {
  const { vendor } = useVendor();

  const schema = z.object({
    name: z.string().min(1, "Name is required"),
    rate_percentage: z.coerce.number().min(0, "Rate must be positive"),
    is_default: z.boolean(),
    vendor_id: z.number(),
  });

  type FormData = {
    name: string;
    rate_percentage: number;
    is_default: boolean;
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
      name: initialData?.name || "",
      rate_percentage: initialData?.rate_percentage ? Number(initialData.rate_percentage) : 0,
      is_default: initialData?.is_default ?? false,
      vendor_id: vendor?.id,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      if (isEditing && initialData?.id) {
        await api.put(`/taxes/${initialData.id}`, data);
        toast.success("Tax updated successfully");
      } else {
        await api.post("/taxes", data);
        toast.success("Tax created successfully");
      }
      if (onSuccess) onSuccess();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        Object.entries(error.response?.data?.errors).forEach(([key, value]) => {
          setError(key as any, { type: "manual", message: (value as string[])[0] });
        });
      }
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <form className="space-y-4 w-full" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          isRequired
          label="Tax Name"
          placeholder="e.g. VAT"
          variant="bordered"
          {...register("name")}
          errorMessage={errors.name?.message}
          isInvalid={!!errors.name}
        />
        <Input
          isRequired
          label="Rate (%)"
          type="number"
          variant="bordered"
          {...register("rate_percentage")}
          errorMessage={errors.rate_percentage?.message}
          isInvalid={!!errors.rate_percentage}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          isSelected={watch("is_default")}
          onValueChange={(val) => setValue("is_default", val)}
        />
        <span className="text-sm font-medium">Default Tax</span>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button color="default" variant="flat" onPress={onCancel}>Cancel</Button>
        <Button color="primary" isLoading={isSubmitting} type="submit">
          {isEditing ? "Update Tax" : "Create Tax"}
        </Button>
      </div>
    </form>
  );
}
