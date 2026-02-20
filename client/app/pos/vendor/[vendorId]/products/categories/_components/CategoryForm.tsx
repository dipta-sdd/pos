"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Input,
  Button,
  Textarea,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";

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
  const [categories, setCategories] = useState<Category[]>([]);

  const categorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    vendor_id: z.number(),
    parent_id: z.number().nullable().optional(),
  });

  type CategoryFormData = z.infer<typeof categorySchema>;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response: any = await api.get(`/categories`, {
          params: {
            per_page: -1,
          },
        });

        setCategories(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchCategories();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
    watch,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      vendor_id: vendor?.id,
      parent_id: initialData?.parent_id || null,
    },
  });

  const parentId = watch("parent_id");

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

      <Autocomplete
        errorMessage={errors.parent_id?.message}
        isInvalid={!!errors.parent_id}
        label="Parent Category"
        placeholder="Select Parent Category"
        selectedKey={parentId ? String(parentId) : null}
        variant="bordered"
        onSelectionChange={(key) => {
          setValue("parent_id", key ? Number(key) : null);
        }}
      >
        {categories.map((category) => (
          <AutocompleteItem key={category.id}>{category.name}</AutocompleteItem>
        ))}
      </Autocomplete>

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
