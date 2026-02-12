"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Input, Button } from "@heroui/react";

import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import { ExpenseCategory } from "@/lib/types/general";

interface ExpenseCategoryFormProps {
  initialData?: ExpenseCategory | null;
  isEditing?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ExpenseCategoryForm({
  initialData,
  isEditing = false,
  onSuccess,
  onCancel,
}: ExpenseCategoryFormProps) {
  const { vendor } = useVendor();

  const schema = z.object({
    name: z.string().min(1, "Name is required"),
    vendor_id: z.number(),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || "",
      vendor_id: vendor?.id,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing && initialData?.id) {
        await api.put(`/expense-categories/${initialData.id}`, data);
        toast.success("Category updated successfully");
      } else {
        await api.post("/expense-categories", data);
        toast.success("Category created successfully");
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
      <Input
        isRequired
        label="Category Name"
        placeholder="e.g. Utilities"
        variant="bordered"
        {...register("name")}
        errorMessage={errors.name?.message}
        isInvalid={!!errors.name}
      />
      <div className="flex justify-end gap-3 pt-4">
        <Button color="default" variant="flat" onPress={onCancel}>
          Cancel
        </Button>
        <Button color="primary" isLoading={isSubmitting} type="submit">
          {isEditing ? "Update Category" : "Create Category"}
        </Button>
      </div>
    </form>
  );
}
