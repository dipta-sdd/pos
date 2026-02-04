"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Input, Button, Select, SelectItem, Switch } from "@heroui/react";
import { useEffect, useState } from "react";

import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import { Promotion, Product, Category } from "@/lib/types/general";

interface PromotionFormProps {
  initialData?: Promotion | null;
  isEditing?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PromotionForm({
  initialData,
  isEditing = false,
  onSuccess,
  onCancel,
}: PromotionFormProps) {
  const { vendor } = useVendor();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const promotionSchema = z.object({
    name: z.string().min(1, "Name is required"),
    discount_type: z.enum(["percentage", "fixed"]),
    discount_value: z.coerce.number().min(0, "Value must be positive"),
    applies_to: z.enum(["all_products", "specific_product", "specific_category"]),
    product_id: z.any().optional(),
    category_id: z.any().optional(),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().optional().or(z.literal("")),
    is_active: z.boolean(),
    vendor_id: z.number(),
  });

  type PromotionFormData = {
    name: string;
    discount_type: "percentage" | "fixed";
    discount_value: number;
    applies_to: "all_products" | "specific_product" | "specific_category";
    product_id?: number;
    category_id?: number;
    start_date: string;
    end_date?: string;
    is_active: boolean;
    vendor_id: number;
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    setError,
  } = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      discount_type: (initialData?.discount_type as any) || "percentage",
      discount_value: initialData?.discount_value ? Number(initialData.discount_value) : 0,
      applies_to: (initialData?.applies_to as any) || "all_products",
      product_id: initialData?.product_id,
      category_id: initialData?.category_id,
      start_date: initialData?.start_date ? new Date(initialData.start_date).toISOString().split('T')[0] : undefined,
      end_date: initialData?.end_date ? new Date(initialData.end_date).toISOString().split('T')[0] : undefined,
      is_active: initialData?.is_active ?? true,
      vendor_id: vendor?.id,
    },
  });

  useEffect(() => {
    if (vendor?.id) {
      fetchProducts();
      fetchCategories();
    }
  }, [vendor?.id]);

  const fetchProducts = async () => {
    try {
      const response: any = await api.get(`/products?vendor_id=${vendor?.id}&per_page=100`);
      setProducts(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response: any = await api.get(`/categories?vendor_id=${vendor?.id}&per_page=100`);
      setCategories(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (isEditing && initialData?.id) {
        await api.put(`/promotions/${initialData.id}`, data);
        toast.success("Promotion updated successfully");
      } else {
        await api.post("/promotions", data);
        toast.success("Promotion created successfully");
      }

      if (onSuccess) {
        onSuccess();
      }
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

  const appliesTo = watch("applies_to");

  return (
    <form className="space-y-4 w-full" onSubmit={handleSubmit(onSubmit)}>
      <Input
        isRequired
        label="Promotion Name"
        placeholder="e.g. Summer Sale"
        variant="bordered"
        {...register("name")}
        errorMessage={errors.name?.message}
        isInvalid={!!errors.name}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          isRequired
          label="Discount Type"
          selectedKeys={[watch("discount_type")]}
          variant="bordered"
          onChange={(e) => setValue("discount_type", e.target.value as any)}
        >
          <SelectItem key="percentage" textValue="Percentage (%)">Percentage (%)</SelectItem>
          <SelectItem key="fixed" textValue="Fixed Amount">Fixed Amount</SelectItem>
        </Select>

        <Input
          isRequired
          label="Discount Value"
          type="number"
          variant="bordered"
          {...register("discount_value")}
          errorMessage={errors.discount_value?.message}
          isInvalid={!!errors.discount_value}
        />
      </div>

      <Select
        isRequired
        label="Applies To"
        selectedKeys={[watch("applies_to")]}
        variant="bordered"
        onChange={(e) => setValue("applies_to", e.target.value as any)}
      >
        <SelectItem key="all_products" textValue="All Products">All Products</SelectItem>
        <SelectItem key="specific_product" textValue="Specific Product">Specific Product</SelectItem>
        <SelectItem key="specific_category" textValue="Specific Category">Specific Category</SelectItem>
      </Select>

      {appliesTo === "specific_product" && (
        <Select
          isRequired
          label="Product"
          selectedKeys={watch("product_id") ? [String(watch("product_id"))] : []}
          variant="bordered"
          onChange={(e) => setValue("product_id", Number(e.target.value))}
        >
          {products.map((p) => (
            <SelectItem key={p.id} textValue={p.name}>{p.name}</SelectItem>
          ))}
        </Select>
      )}

      {appliesTo === "specific_category" && (
        <Select
          isRequired
          label="Category"
          selectedKeys={watch("category_id") ? [String(watch("category_id"))] : []}
          variant="bordered"
          onChange={(e) => setValue("category_id", Number(e.target.value))}
        >
          {categories.map((c) => (
            <SelectItem key={c.id} textValue={c.name}>{c.name}</SelectItem>
          ))}
        </Select>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          isRequired
          label="Start Date"
          type="date"
          variant="bordered"
          {...register("start_date")}
          errorMessage={errors.start_date?.message}
          isInvalid={!!errors.start_date}
        />

        <Input
          label="End Date"
          type="date"
          variant="bordered"
          {...register("end_date")}
          errorMessage={errors.end_date?.message}
          isInvalid={!!errors.end_date}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          isSelected={watch("is_active")}
          onValueChange={(val) => setValue("is_active", val)}
        />
        <span className="text-sm font-medium">Active</span>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button color="default" variant="flat" onPress={onCancel}>
          Cancel
        </Button>
        <Button color="primary" isLoading={isSubmitting} type="submit">
          {isEditing ? "Update Promotion" : "Create Promotion"}
        </Button>
      </div>
    </form>
  );
}
