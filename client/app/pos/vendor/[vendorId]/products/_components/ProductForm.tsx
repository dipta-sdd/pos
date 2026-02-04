"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input, Button, Textarea, Select, SelectItem, Card, CardBody } from "@heroui/react";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import { Product, Category, UnitOfMeasure } from "@/lib/types/general";

interface ProductFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export default function ProductForm({
  initialData,
  isEditing = false,
}: ProductFormProps) {
  const { vendor } = useVendor();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);

  const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    category_id: z.any().optional(),
    unit_of_measure_id: z.any().optional(),
    vendor_id: z.number(),
    variants: z.array(z.object({
      id: z.number().optional(),
      name: z.string().min(1, "Variant name is required"),
      value: z.string().min(1, "Variant value is required"),
      sku: z.string().optional().nullable(),
      barcode: z.string().optional().nullable(),
      unit_of_measure_id: z.any().optional(),
    })).min(1, "At least one variant is required"),
  });

  type ProductFormData = {
    name: string;
    description?: string;
    category_id?: number;
    unit_of_measure_id?: number;
    vendor_id: number;
    variants: {
      id?: number;
      name: string;
      value: string;
      sku?: string | null;
      barcode?: string | null;
      unit_of_measure_id?: number;
    }[];
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    setError,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      category_id: initialData?.category_id,
      unit_of_measure_id: initialData?.unit_of_measure_id,
      vendor_id: vendor?.id,
      variants: initialData?.variants?.length > 0 ? initialData.variants : [{ name: "Standard", value: "Default", sku: "", barcode: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  useEffect(() => {
    if (vendor?.id) {
      fetchCategories();
      fetchUnits();
    }
  }, [vendor?.id]);

  const fetchCategories = async () => {
    try {
      const response: any = await api.get(`/categories?vendor_id=${vendor?.id}&per_page=100`);
      setCategories(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const fetchUnits = async () => {
    try {
      const response: any = await api.get(`/units-of-measure?vendor_id=${vendor?.id}&per_page=100`);
      setUnits(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch units", error);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (isEditing && initialData?.id) {
        await api.put(`/products/${initialData.id}`, data);
        toast.success("Product updated successfully");
      } else {
        await api.post("/products", data);
        toast.success("Product created successfully");
      }
      router.push(`/pos/vendor/${vendor?.id}/products`);
    } catch (error: any) {
      if (error.response?.data?.errors) {
        Object.entries(error.response?.data?.errors).forEach(([key, value]) => {
          // Handle nested errors for variants
          if (key.startsWith("variants.")) {
            toast.error((value as string[])[0]);
          } else {
            setError(key as any, {
              type: "manual",
              message: (value as string[])[0],
            });
          }
        });
      }
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardBody className="p-6 space-y-6">
          <h3 className="text-lg font-semibold">General Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              isRequired
              label="Product Name"
              placeholder="iPhone 15 Pro"
              variant="bordered"
              {...register("name")}
              errorMessage={errors.name?.message}
              isInvalid={!!errors.name}
            />

            <Select
              label="Category"
              placeholder="Select category"
              selectedKeys={watch("category_id") ? [String(watch("category_id"))] : []}
              variant="bordered"
              onChange={(e) => setValue("category_id", Number(e.target.value))}
            >
              {categories.map((cat) => (
                <SelectItem key={cat.id} textValue={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </Select>

            <div className="md:col-span-2">
              <Textarea
                label="Description"
                placeholder="Product details..."
                variant="bordered"
                {...register("description")}
                errorMessage={errors.description?.message}
                isInvalid={!!errors.description}
              />
            </div>

            <Select
              label="Base Unit of Measure"
              placeholder="Select unit"
              selectedKeys={watch("unit_of_measure_id") ? [String(watch("unit_of_measure_id"))] : []}
              variant="bordered"
              onChange={(e) => setValue("unit_of_measure_id", Number(e.target.value))}
            >
              {units.map((unit) => (
                <SelectItem key={unit.id} textValue={unit.name}>
                  {unit.name} ({unit.abbreviation})
                </SelectItem>
              ))}
            </Select>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Product Variants</h3>
            <Button
              color="primary"
              size="sm"
              startContent={<Plus className="w-4 h-4" />}
              variant="flat"
              onPress={() => append({ name: "", value: "", sku: "", barcode: "" })}
            >
              Add Variant
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg bg-gray-50/50 space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Variant #{index + 1}</h4>
                  {fields.length > 1 && (
                    <Button
                      isIconOnly
                      color="danger"
                      size="sm"
                      variant="light"
                      onPress={() => remove(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Input
                    isRequired
                    label="Type"
                    placeholder="e.g. Color"
                    size="sm"
                    variant="bordered"
                    {...register(`variants.${index}.name` as const)}
                    errorMessage={errors.variants?.[index]?.name?.message}
                    isInvalid={!!errors.variants?.[index]?.name}
                  />
                  <Input
                    isRequired
                    label="Value"
                    placeholder="e.g. Space Gray"
                    size="sm"
                    variant="bordered"
                    {...register(`variants.${index}.value` as const)}
                    errorMessage={errors.variants?.[index]?.value?.message}
                    isInvalid={!!errors.variants?.[index]?.value}
                  />
                  <Input
                    label="SKU"
                    placeholder="SKU-123"
                    size="sm"
                    variant="bordered"
                    {...register(`variants.${index}.sku` as const)}
                  />
                  <Input
                    label="Barcode"
                    placeholder="UPC/EAN"
                    size="sm"
                    variant="bordered"
                    {...register(`variants.${index}.barcode` as const)}
                  />
                </div>
              </div>
            ))}
          </div>
          {errors.variants?.root && (
            <p className="text-danger text-sm">{errors.variants.root.message}</p>
          )}
        </CardBody>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          color="default"
          variant="flat"
          onPress={() => router.back()}
        >
          Cancel
        </Button>
        <Button color="primary" isLoading={isSubmitting} type="submit">
          {isEditing ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
