"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Input, Button, Textarea } from "@heroui/react";

import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import { Customer } from "@/lib/types/general";

interface CustomerFormProps {
  initialData?: Customer | null;
  isEditing?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CustomerForm({
  initialData,
  isEditing = false,
  onSuccess,
  onCancel,
}: CustomerFormProps) {
  const { vendor } = useVendor();

  const customerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional(),
    vendor_id: z.number(),
  });

  type CustomerFormData = z.infer<typeof customerSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      vendor_id: vendor?.id,
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    try {
      if (isEditing && initialData?.id) {
        await api.put(`/customers/${initialData.id}`, data);
        toast.success("Customer updated successfully");
      } else {
        await api.post("/customers", data);
        toast.success("Customer created successfully");
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        Object.entries(error.response?.data?.errors).forEach(([key, value]) => {
          setError(key as keyof CustomerFormData, {
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
        label="Name"
        placeholder="Customer Name"
        variant="bordered"
        {...register("name")}
        errorMessage={errors.name?.message}
        isInvalid={!!errors.name}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Email"
          placeholder="email@example.com"
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
        placeholder="Customer Address"
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
          {isEditing ? "Update Customer" : "Create Customer"}
        </Button>
      </div>
    </form>
  );
}
