"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input, Button, Select, SelectItem, Card, CardBody, Textarea } from "@heroui/react";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import { Branch, Variant } from "@/lib/types/general";

interface StockTransferFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export default function StockTransferForm({
  initialData,
  isEditing = false,
}: StockTransferFormProps) {
  const { vendor } = useVendor();
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);

  const transferSchema = z.object({
    from_branch_id: z.any(),
    to_branch_id: z.any(),
    notes: z.string().optional(),
    status: z.string().default("pending"),
    vendor_id: z.number(),
    items: z.array(z.object({
      variant_id: z.any(),
      quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
    })).min(1, "At least one item is required"),
  });

  type TransferFormData = {
    from_branch_id: number;
    to_branch_id: number;
    notes?: string;
    status: string;
    vendor_id: number;
    items: {
      variant_id: number;
      quantity: number;
    }[];
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema) as any,
    defaultValues: {
      from_branch_id: initialData?.from_branch_id,
      to_branch_id: initialData?.to_branch_id,
      notes: initialData?.notes || "",
      status: initialData?.status || "pending",
      vendor_id: vendor?.id,
      items: initialData?.stock_transfer_items?.map((i: any) => ({
        variant_id: i.variant_id,
        quantity: i.quantity,
      })) || [{ variant_id: undefined, quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    if (vendor?.id) {
      fetchBranches();
      fetchVariants();
    }
  }, [vendor?.id]);

  const fetchBranches = async () => {
    try {
      const response: any = await api.get(`/branches?vendor_id=${vendor?.id}&per_page=100`);
      setBranches(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch branches", error);
    }
  };

  const fetchVariants = async () => {
    try {
      const response: any = await api.get(`/variants?vendor_id=${vendor?.id}&per_page=1000`);
      setVariants(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch variants", error);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (isEditing && initialData?.id) {
        await api.put(`/stock-transfers/${initialData.id}`, data);
        toast.success("Transfer updated successfully");
      } else {
        await api.post("/stock-transfers", data);
        toast.success("Transfer created successfully");
      }
      router.push(`/pos/vendor/${vendor?.id}/inventory/transfers`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardBody className="p-6 space-y-6">
          <h3 className="text-lg font-semibold">Transfer Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              isRequired
              label="From Branch"
              placeholder="Select source branch"
              selectedKeys={watch("from_branch_id") ? [String(watch("from_branch_id"))] : []}
              variant="bordered"
              onChange={(e) => setValue("from_branch_id", Number(e.target.value))}
            >
              {branches.map((b) => (
                <SelectItem key={b.id} textValue={b.name}>{b.name}</SelectItem>
              ))}
            </Select>

            <Select
              isRequired
              label="To Branch"
              placeholder="Select destination branch"
              selectedKeys={watch("to_branch_id") ? [String(watch("to_branch_id"))] : []}
              variant="bordered"
              onChange={(e) => setValue("to_branch_id", Number(e.target.value))}
            >
              {branches.map((b) => (
                <SelectItem key={b.id} textValue={b.name}>{b.name}</SelectItem>
              ))}
            </Select>

            <div className="md:col-span-2">
              <Textarea
                label="Notes"
                placeholder="Optional transfer notes..."
                variant="bordered"
                {...register("notes")}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Items</h3>
            <Button
              color="primary"
              size="sm"
              startContent={<Plus className="w-4 h-4" />}
              variant="flat"
              onPress={() => append({ variant_id: 0, quantity: 1 })}
            >
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end border-b pb-4 last:border-0">
                <div className="md:col-span-8">
                  <Select
                    isRequired
                    label="Product Variant"
                    placeholder="Select variant"
                    selectedKeys={watch(`items.${index}.variant_id`) ? [String(watch(`items.${index}.variant_id`))] : []}
                    size="sm"
                    variant="bordered"
                    onChange={(e) => setValue(`items.${index}.variant_id`, Number(e.target.value))}
                  >
                    {variants.map((v) => (
                      <SelectItem key={v.id} textValue={`${v.product?.name} - ${v.name}`}>
                        {v.product?.name} - {v.name} ({v.sku})
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="md:col-span-3">
                  <Input
                    isRequired
                    label="Quantity"
                    type="number"
                    variant="bordered"
                    {...register(`items.${index}.quantity` as const)}
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
        <Button color="default" variant="flat" onPress={() => router.back()}>Cancel</Button>
        <Button color="primary" isLoading={isSubmitting} type="submit">
          {isEditing ? "Update Transfer" : "Create Transfer"}
        </Button>
      </div>
    </form>
  );
}
