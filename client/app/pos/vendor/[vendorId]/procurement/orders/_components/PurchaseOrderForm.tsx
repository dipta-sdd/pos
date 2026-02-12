"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Input,
  Button,
  Select,
  SelectItem,
  Card,
  CardBody,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import { Supplier, Branch, Variant } from "@/lib/types/general";

interface PurchaseOrderFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export default function PurchaseOrderForm({
  initialData,
  isEditing = false,
}: PurchaseOrderFormProps) {
  const { vendor } = useVendor();
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);

  const orderSchema = z.object({
    supplier_id: z.any(),
    branch_id: z.any(),
    order_date: z.string().min(1, "Order date is required"),
    expected_delivery_date: z.string().optional().or(z.literal("")),
    notes: z.string().optional(),
    status: z.string().default("pending"),
    vendor_id: z.number(),
    items: z
      .array(
        z.object({
          variant_id: z.any(),
          quantity: z.coerce
            .number()
            .min(0.01, "Quantity must be greater than 0"),
          unit_price: z.coerce.number().min(0, "Price must be positive"),
        }),
      )
      .min(1, "At least one item is required"),
  });

  type OrderFormData = {
    supplier_id: number;
    branch_id: number;
    order_date: string;
    expected_delivery_date?: string;
    notes?: string;
    status: string;
    vendor_id: number;
    items: {
      variant_id: number;
      quantity: number;
      unit_price: number;
    }[];
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema) as any,
    defaultValues: {
      supplier_id: initialData?.supplier_id,
      branch_id: initialData?.branch_id,
      order_date: initialData?.order_date
        ? new Date(initialData.order_date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      expected_delivery_date: initialData?.expected_delivery_date
        ? new Date(initialData.expected_delivery_date)
            .toISOString()
            .split("T")[0]
        : "",
      notes: initialData?.notes || "",
      status: initialData?.status || "pending",
      vendor_id: vendor?.id,
      items: initialData?.purchase_order_items?.map((i: any) => ({
        variant_id: i.variant_id,
        quantity: i.quantity,
        unit_price: i.unit_price,
      })) || [{ variant_id: undefined, quantity: 1, unit_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    if (vendor?.id) {
      fetchSuppliers();
      fetchBranches();
      fetchVariants();
    }
  }, [vendor?.id]);

  const fetchSuppliers = async () => {
    try {
      const response: any = await api.get(
        `/suppliers?vendor_id=${vendor?.id}&per_page=100`,
      );

      setSuppliers(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch suppliers", error);
    }
  };

  const fetchBranches = async () => {
    try {
      const response: any = await api.get(
        `/branches?vendor_id=${vendor?.id}&per_page=100`,
      );

      setBranches(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch branches", error);
    }
  };

  const fetchVariants = async () => {
    try {
      const response: any = await api.get(
        `/variants?vendor_id=${vendor?.id}&per_page=1000`,
      );

      setVariants(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch variants", error);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (isEditing && initialData?.id) {
        await api.put(`/purchase-orders/${initialData.id}`, data);
        toast.success("Order updated successfully");
      } else {
        await api.post("/purchase-orders", data);
        toast.success("Order created successfully");
      }
      router.push(`/pos/vendor/${vendor?.id}/procurement/orders`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardBody className="p-6 space-y-6">
          <h3 className="text-lg font-semibold">General Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              isRequired
              label="Supplier"
              placeholder="Select supplier"
              selectedKeys={
                watch("supplier_id") ? [String(watch("supplier_id"))] : []
              }
              variant="bordered"
              onChange={(e) => setValue("supplier_id", Number(e.target.value))}
            >
              {suppliers.map((s) => (
                <SelectItem key={s.id} textValue={s.name}>
                  {s.name}
                </SelectItem>
              ))}
            </Select>

            <Select
              isRequired
              label="Branch"
              placeholder="Select destination branch"
              selectedKeys={
                watch("branch_id") ? [String(watch("branch_id"))] : []
              }
              variant="bordered"
              onChange={(e) => setValue("branch_id", Number(e.target.value))}
            >
              {branches.map((b) => (
                <SelectItem key={b.id} textValue={b.name}>
                  {b.name}
                </SelectItem>
              ))}
            </Select>

            <Input
              isRequired
              label="Order Date"
              type="date"
              variant="bordered"
              {...register("order_date")}
              errorMessage={errors.order_date?.message}
              isInvalid={!!errors.order_date}
            />

            <Input
              label="Expected Delivery"
              type="date"
              variant="bordered"
              {...register("expected_delivery_date")}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Order Items</h3>
            <Button
              color="primary"
              size="sm"
              startContent={<Plus className="w-4 h-4" />}
              variant="flat"
              onPress={() =>
                append({ variant_id: 0, quantity: 1, unit_price: 0 })
              }
            >
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end border-b pb-4 last:border-0"
              >
                <div className="md:col-span-6">
                  <Select
                    isRequired
                    label="Product Variant"
                    placeholder="Select variant"
                    selectedKeys={
                      watch(`items.${index}.variant_id`)
                        ? [String(watch(`items.${index}.variant_id`))]
                        : []
                    }
                    size="sm"
                    variant="bordered"
                    onChange={(e) =>
                      setValue(
                        `items.${index}.variant_id`,
                        Number(e.target.value),
                      )
                    }
                  >
                    {variants.map((v) => (
                      <SelectItem
                        key={v.id}
                        textValue={`${v.product?.name} - ${v.name}`}
                      >
                        {v.product?.name} - {v.name} ({v.sku})
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Input
                    isRequired
                    label="Qty"
                    type="number"
                    variant="bordered"
                    {...register(`items.${index}.quantity` as const)}
                    size="sm"
                  />
                </div>
                <div className="md:col-span-3">
                  <Input
                    isRequired
                    label="Unit Price"
                    type="number"
                    variant="bordered"
                    {...register(`items.${index}.unit_price` as const)}
                    size="sm"
                  />
                </div>
                <div className="md:col-span-1 flex justify-center">
                  <Button
                    isIconOnly
                    color="danger"
                    size="sm"
                    variant="light"
                    onPress={() => remove(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="flex justify-end gap-3">
        <Button color="default" variant="flat" onPress={() => router.back()}>
          Cancel
        </Button>
        <Button color="primary" isLoading={isSubmitting} type="submit">
          {isEditing ? "Update Order" : "Create Order"}
        </Button>
      </div>
    </form>
  );
}
