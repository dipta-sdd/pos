"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input, Button, Textarea } from "@heroui/react";

import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import { Category } from "@/lib/types/general";

interface CategoryFormProps {
  initialData?: Category | null;
  isEditing?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CategoryForm({
  initialData,
  isEditing = false,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const { vendor } = useVendor();
  const router = useRouter();

  const categorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    vendor_id: z.number(),
  });

  type CategoryFormData = z.infer<typeof categorySchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      vendor_id: vendor?.id,
    },
  });

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (isEditing && initialData?.id) {
        await api.put(`/categories/${initialData.id}`, data);
        toast.success("Category updated successfully");
      } else {
        await api.post("/categories", data);
        toast.success("Category created successfully");
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        Object.entries(error.response?.data?.errors).forEach(([key, value]) => {
          setError(key as keyof CategoryFormData, {
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
        placeholder="Category Name"
        variant="bordered"
        {...register("name")}
        errorMessage={errors.name?.message}
        isInvalid={!!errors.name}
      />

      <Textarea
        label="Description"
        placeholder="Category Description"
        variant="bordered"
        {...register("description")}
        errorMessage={errors.description?.message}
        isInvalid={!!errors.description}
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
