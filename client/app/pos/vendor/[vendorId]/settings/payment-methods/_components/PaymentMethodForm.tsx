"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Input, Button, Switch } from "@heroui/react";

import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import { PaymentMethod } from "@/lib/types/general";

interface PaymentMethodFormProps {
  initialData?: PaymentMethod | null;
  isEditing?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PaymentMethodForm({
  initialData,
  isEditing = false,
  onSuccess,
  onCancel,
}: PaymentMethodFormProps) {
  const { vendor } = useVendor();

  const schema = z.object({
    name: z.string().min(1, "Name is required"),
    is_active: z.boolean(),
    vendor_id: z.number(),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || "",
      is_active: initialData?.is_active ?? true,
      vendor_id: vendor?.id,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing && initialData?.id) {
        await api.put(`/payment-methods/${initialData.id}`, data);
        toast.success("Payment method updated successfully");
      } else {
        await api.post("/payment-methods", data);
        toast.success("Payment method created successfully");
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
      <Input
        isRequired
        label="Method Name"
        placeholder="e.g. Cash, Credit Card"
        variant="bordered"
        {...register("name")}
        errorMessage={errors.name?.message}
        isInvalid={!!errors.name}
      />

      <div className="flex items-center gap-2">
        <Switch
          isSelected={watch("is_active")}
          onValueChange={(val) => setValue("is_active", val)}
        />
        <span className="text-sm font-medium">Active</span>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button color="default" variant="flat" onPress={onCancel}>Cancel</Button>
        <Button color="primary" isLoading={isSubmitting} type="submit">
          {isEditing ? "Update Method" : "Create Method"}
        </Button>
      </div>
    </form>
  );
}
