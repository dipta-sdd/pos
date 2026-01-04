"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { Input, Textarea, Button } from "@heroui/react";

import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";

interface BranchFormProps {
  initialData?: any;
  isEditing?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function BranchForm({
  initialData,
  isEditing = false,
  onSuccess,
  onCancel,
}: BranchFormProps) {
  const { vendor } = useVendor();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    trigger,
  } = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      vendor_id: vendor?.id,
    },
  });

  const onSubmit = async (data: BranchFormData) => {
    try {
      if (isEditing && initialData?.id) {
        await api.put(`/branches/${initialData.id}`, data);
        toast.success("Branch updated successfully");
      } else {
        await api.post("/branches", data);
        toast.success("Branch created successfully");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (error: any) {
    } 
  };
  console.log(errors);
  return (
    <form className="space-y-6 w-full" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <Input
          id="branch-name"
          isRequired
          label="Branch Name"
          type="text"
          placeholder="e.g., Main Branch"
          variant="bordered"
          {...register("name")}
          errorMessage={errors.name?.message}
          isInvalid={!!errors.name}
        />

        <Textarea
          label="Description"
          placeholder="Optional description"
          variant="bordered"
          {...register("description")}
          errorMessage={errors.description?.message}
          isInvalid={!!errors.description}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Phone"
            placeholder="e.g., +1234567890"
            variant="bordered"
            {...register("phone")}
            errorMessage={errors.phone?.message}
            isInvalid={!!errors.phone}
          />
          <Input
            label="Address"
            placeholder="e.g., 123 Main St"
            variant="bordered"
            {...register("address")}
            errorMessage={errors.address?.message}
            isInvalid={!!errors.address}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button color="default" variant="flat" onPress={onCancel}>
          Cancel
        </Button>
        <Button color="primary" isLoading={isSubmitting} type="submit">
          {isEditing ? "Update Branch" : "Create Branch"}
        </Button>
      </div>
    </form>
  );
}

// Vendor onboarding validation schema
export const branchSchema = z.object({
  vendor_id: z.number().optional(),
  name: z
    .string()
    .min(1, "Branch name is required")
    .min(3, "Branch name must be at least 3 characters")
    .max(100, "Branch name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_&.]+$/, "Vendor name contains invalid characters"),

  description: z
    .string()
    .min(0)
    .max(500, "Description must be less than 500 characters")
    .optional(),

  phone: z
    .string()
    .min(1, "Phone number is required")
    .min(11, "Phone number must be at least 11 digits")
    .regex(/^[0-9+\-\s()]+$/, "Please enter a valid phone number"),

  address: z
    .string()
    .min(1, "Address is required")
    .min(10, "Address must be at least 10 characters")
    .max(200, "Address must be less than 200 characters"),
});

export type BranchFormData = z.infer<typeof branchSchema>;

export const branchUpdateSchema = branchSchema.partial();

export type BranchUpdateFormData = z.infer<typeof branchUpdateSchema>;
