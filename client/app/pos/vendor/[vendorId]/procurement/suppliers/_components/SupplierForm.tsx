"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Input, Button, Textarea } from "@heroui/react";

import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import { Supplier } from "@/lib/types/general";

interface SupplierFormProps {
  initialData?: Supplier | null;
  isEditing?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function SupplierForm({
  initialData,
  isEditing = false,
  onSuccess,
  onCancel,
}: SupplierFormProps) {
  const { vendor } = useVendor();

  const supplierSchema = z.object({
    name: z.string().min(1, "Name is required"),
    contact_person: z.string().optional(),
    email: z
      .string()
      .email("Invalid email address")
      .optional()
      .or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional(),
    vendor_id: z.number(),
  });

  type SupplierFormData = z.infer<typeof supplierSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: initialData?.name || "",
      contact_person: initialData?.contact_person || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      vendor_id: vendor?.id,
    },
  });

  const onSubmit = async (data: SupplierFormData) => {
    try {
      if (isEditing && initialData?.id) {
        await api.put(`/suppliers/${initialData.id}`, data);
        toast.success("Supplier updated successfully");
      } else {
        await api.post("/suppliers", data);
        toast.success("Supplier created successfully");
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        Object.entries(error.response?.data?.errors).forEach(([key, value]) => {
          setError(key as keyof SupplierFormData, {
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
      <Input
        isRequired
        label="Supplier Name"
        placeholder="e.g. Acme Corp"
        variant="bordered"
        {...register("name")}
        errorMessage={errors.name?.message}
        isInvalid={!!errors.name}
      />

      <Input
        label="Contact Person"
        placeholder="John Doe"
        variant="bordered"
        {...register("contact_person")}
        errorMessage={errors.contact_person?.message}
        isInvalid={!!errors.contact_person}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Email"
          placeholder="supplier@example.com"
          type="email"
          variant="bordered"
          {...register("email")}
          errorMessage={errors.email?.message}
          isInvalid={!!errors.email}
        />

        <Input
          label="Phone"
          placeholder="+1234567890"
          variant="bordered"
          {...register("phone")}
          errorMessage={errors.phone?.message}
          isInvalid={!!errors.phone}
        />
      </div>

      <Textarea
        label="Address"
        placeholder="Supplier Address"
        variant="bordered"
        {...register("address")}
        errorMessage={errors.address?.message}
        isInvalid={!!errors.address}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button color="default" variant="flat" onPress={onCancel}>
          Cancel
        </Button>
        <Button color="primary" isLoading={isSubmitting} type="submit">
          {isEditing ? "Update Supplier" : "Create Supplier"}
        </Button>
      </div>
    </form>
  );
}
