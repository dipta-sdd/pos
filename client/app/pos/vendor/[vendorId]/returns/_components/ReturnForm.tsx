"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Input, Button, Select, SelectItem, Card, CardBody, Textarea } from "@heroui/react";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";

interface ReturnFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReturnForm({
  onSuccess,
  onCancel,
}: ReturnFormProps) {
  const { vendor } = useVendor();
  const [sales, setSales] = useState<any[]>([]);
  const [selectedSale, setSelectedSale] = useState<any>(null);

  const schema = z.object({
    original_sale_id: z.any(),
    reason: z.string().optional(),
    refund_type: z.enum(["cash_back", "store_credit", "exchange"]),
    refund_amount: z.coerce.number().min(0, "Amount must be positive"),
    vendor_id: z.number(),
    branch_id: z.any(),
    items: z.array(z.object({
      sale_item_id: z.any(),
      quantity: z.coerce.number().min(0.01, "Quantity must be positive"),
    })).min(1, "At least one item is required"),
  });

  type FormData = {
    original_sale_id: number;
    reason?: string;
    refund_type: "cash_back" | "store_credit" | "exchange";
    refund_amount: number;
    vendor_id: number;
    branch_id: number;
    items: {
      sale_item_id: number;
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
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      refund_type: "cash_back",
      refund_amount: 0,
      vendor_id: vendor?.id,
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items" as any,
  });

  useEffect(() => {
    if (vendor?.id) {
      fetchSales();
    }
  }, [vendor?.id]);

  const fetchSales = async () => {
    try {
      const response: any = await api.get(`/sales?vendor_id=${vendor?.id}&per_page=100`);
      setSales(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch sales", error);
    }
  };

  const onSaleChange = async (saleId: number) => {
    setValue("original_sale_id", saleId);
    try {
      const response: any = await api.get(`/sales/${saleId}`);
      const sale = response?.data;
      setSelectedSale(sale);
      setValue("branch_id", sale.branch_id);
    } catch (error) {
      console.error("Failed to fetch sale details", error);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      await api.post("/sale-returns", data);
      toast.success("Return processed successfully");
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <form className="space-y-6 w-full" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          isRequired
          label="Select Sale"
          placeholder="Choose a sale to return"
          variant="bordered"
          onChange={(e) => onSaleChange(Number(e.target.value))}
        >
          {sales.map((s) => (
            <SelectItem key={s.id} textValue={`Sale #${s.id} - ${s.final_amount}`}>
              Sale #{s.id} - {s.final_amount} ({new Date(s.created_at).toLocaleDateString()})
            </SelectItem>
          ))}
        </Select>

        <Select
          isRequired
          label="Refund Type"
          selectedKeys={[watch("refund_type")]}
          variant="bordered"
          onChange={(e) => setValue("refund_type", e.target.value as any)}
        >
          <SelectItem key="cash_back" textValue="Cash Back">Cash Back</SelectItem>
          <SelectItem key="store_credit" textValue="Store Credit">Store Credit</SelectItem>
          <SelectItem key="exchange" textValue="Exchange">Exchange</SelectItem>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          isRequired
          label="Refund Amount"
          type="number"
          variant="bordered"
          {...register("refund_amount")}
        />
        <Input
            label="Reason"
            placeholder="e.g. Defective product"
            variant="bordered"
            {...register("reason")}
        />
      </div>

      {selectedSale && (
        <Card>
          <CardBody className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Items to Return</h4>
              <Button
                color="primary"
                size="sm"
                startContent={<Plus className="w-4 h-4" />}
                variant="flat"
                onPress={() => append({ sale_item_id: 0, quantity: 1 })}
              >
                Add Item
              </Button>
            </div>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-3 items-end">
                  <Select
                    isRequired
                    className="flex-1"
                    label="Item"
                    placeholder="Select item"
                    size="sm"
                    variant="bordered"
                    onChange={(e) => setValue(`items.${index}.sale_item_id` as any, Number(e.target.value))}
                  >
                    {selectedSale.sale_items?.map((item: any) => (
                      <SelectItem key={item.id} textValue={item.variant?.product?.name}>
                        {item.variant?.product?.name} ({item.quantity} purchased)
                      </SelectItem>
                    ))}
                  </Select>
                  <Input
                    isRequired
                    className="w-24"
                    label="Qty"
                    type="number"
                    variant="bordered"
                    {...register(`items.${index}.quantity` as any)}
                    size="sm"
                  />
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
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button color="default" variant="flat" onPress={onCancel}>Cancel</Button>
        <Button color="primary" isLoading={isSubmitting} type="submit">Process Return</Button>
      </div>
    </form>
  );
}
