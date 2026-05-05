"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Input,
  Button,
  Card,
  CardBody,
  Chip,
  ButtonGroup,
  Checkbox,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { Clock, User, Package } from "lucide-react";

import BulkActionBar from "./BulkActionBar";

import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import { StockTransfer } from "@/lib/types/general";
import { formatDate } from "@/lib/helper/dates";
import { getFullVariantName } from "@/lib/helper/variant";

interface ShippedReceivingTransferFormProps {
  initialData: StockTransfer;
  setInitialData: React.Dispatch<React.SetStateAction<StockTransfer | null>>;
}

const transferSchema = z.object({
  from_branch_id: z.coerce.number(),
  to_branch_id: z.coerce.number(),
  notes: z.string().optional(),
  status: z.string(),
  vendor_id: z.number(),
  items: z.array(
    z.object({
      id: z.number().optional(),
      variant_id: z.coerce.number(),
      quantity: z.coerce.number(),
      received_quantity: z.coerce.number().nullable().optional(),
      status: z.string(),
      variant: z.any().optional(),
      unit_of_measure: z.any().optional(),
    }),
  ),
});

type TransferFormData = z.infer<typeof transferSchema>;

export default function ShippedReceivingTransferForm({
  initialData,
  setInitialData,
}: ShippedReceivingTransferFormProps) {
  const { vendor } = useVendor();
  const router = useRouter();

  const [scanMode, setScanMode] = useState<"increment" | "full">("increment");
  const [scanInput, setScanInput] = useState("");
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set(),
  );
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const { register, handleSubmit, control, setValue, watch, reset } =
    useForm<TransferFormData>({
      // @ts-ignore
      resolver: zodResolver(transferSchema),
      defaultValues: {
        from_branch_id: initialData.from_branch_id,
        to_branch_id: initialData.to_branch_id,
        notes: initialData.notes || "",
        status: initialData.status,
        vendor_id: vendor?.id || 0,
        items:
          initialData.stock_transfer_items?.map((i: any) => ({
            id: i.id,
            variant_id: i.variant_id,
            quantity: i.quantity,
            received_quantity: i.received_quantity,
            status: i.status || "shipped",
            variant: i.variant,
            unit_of_measure: i.unit_of_measure,
          })) || [],
      },
    });

  useEffect(() => {
    if (initialData) {
      reset({
        from_branch_id: initialData.from_branch_id,
        to_branch_id: initialData.to_branch_id,
        notes: initialData.notes || "",
        status: initialData.status,
        vendor_id: vendor?.id || 0,
        items:
          initialData.stock_transfer_items?.map((i: any) => ({
            id: i.id,
            variant_id: i.variant_id,
            quantity: i.quantity,
            received_quantity: i.received_quantity,
            status: i.status || "shipped",
            variant: i.variant,
            unit_of_measure: i.unit_of_measure,
          })) || [],
      });
    }
  }, [initialData, reset, vendor?.id]);

  const { fields } = useFieldArray({ control, name: "items" });
  const watchItems = watch("items");

  const updateItemApi = async (index: number, updates: any) => {
    const item = watchItems[index];

    if (!item?.id) return;
    try {
      await api.put(`/stock-transfers/items/${item.id}`, updates);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update item");
    }
  };

  const handleBarcodeScan = (barcode: string) => {
    const index = watchItems.findIndex(
      (i) => i.variant?.sku === barcode || i.variant?.barcode === barcode,
    );

    if (index === -1) {
      toast.error("Product not found in this transfer");

      return;
    }

    const item = watchItems[index];
    const currentReceived = Number(item.received_quantity || 0);
    const maxQty = Number(
      initialData?.stock_transfer_items?.find((i: any) => i.id === item.id)
        ?.approved_quantity || item.quantity,
    );
    const newReceived =
      scanMode === "full" ? maxQty : Math.min(maxQty, currentReceived + 1);

    setValue(`items.${index}.received_quantity`, newReceived);
    updateItemApi(index, { received_quantity: newReceived });
    setScanInput("");
  };

  const handleBulkAction = async (action: string) => {
    const indices = Array.from(selectedIndices);

    setIsBulkLoading(true);

    try {
      if (action === "receive_all") {
        await Promise.all(
          indices.map(async (index) => {
            const item = watchItems[index];
            const originalItem = initialData.stock_transfer_items?.find(
              (i: any) => i.id === item.id,
            );
            const maxQty = Number(
              originalItem?.approved_quantity ?? originalItem?.quantity,
            );

            setValue(`items.${index}.received_quantity`, maxQty);
            await api.put(`/stock-transfers/items/${item.id}`, {
              received_quantity: maxQty,
            });
          }),
        );
        toast.success("Items marked as received");
      }
      setSelectedIndices(new Set());
    } catch (error) {
      toast.error("Bulk action failed");
    } finally {
      setIsBulkLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIndices.size === fields.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(fields.map((_, i) => i)));
    }
  };

  const toggleSelect = (index: number) => {
    const next = new Set(selectedIndices);

    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setSelectedIndices(next);
  };

  const updateGlobalStatus = async (newStatus: string) => {
    try {
      await api.post(`/stock-transfers/${initialData.id}/status`, {
        status: newStatus,
      });
      toast.success(`Transfer marked as ${newStatus}`);
      setInitialData((prev) => ({
        ...(prev as StockTransfer),
        status: newStatus,
      }));
    } catch (error: any) {
      toast.error("Failed to update status");
    }
  };

  const onSubmit = async (data: any) => {
    try {
      await api.put(`/stock-transfers/${initialData.id}`, data);
      toast.success("Saved successfully");
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Receive Shipment ST-{initialData.id}
            </h1>
            <Chip color="warning" variant="flat">
              Shipped
            </Chip>
          </div>
          <p className="text-default-400 text-sm flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Created on{" "}
              {formatDate(initialData.created_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> by{" "}
              {initialData.created_by?.firstName}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            color="success"
            onPress={() => updateGlobalStatus("completed")}
          >
            Mark Received / Completed
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm">
          <CardBody className="p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-default-500">From Branch</p>
                <p className="font-medium text-lg">
                  {initialData.from_branch?.name}
                </p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-sm text-default-500">To Branch</p>
                <p className="font-medium text-lg">
                  {initialData.to_branch?.name}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
        <Card className="shadow-sm overflow-hidden">
          <CardBody className="p-0">
            <div className="p-8 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-default-50/50">
              <div>
                <h3 className="font-semibold text-lg">Receive Items</h3>
                <p className="text-sm text-default-500">
                  Scan barcodes or manually enter the received quantities.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <ButtonGroup size="sm">
                  <Button
                    color={scanMode === "increment" ? "primary" : "default"}
                    variant={scanMode === "increment" ? "solid" : "flat"}
                    onPress={() => setScanMode("increment")}
                  >
                    +1 Per Scan
                  </Button>
                  <Button
                    color={scanMode === "full" ? "primary" : "default"}
                    variant={scanMode === "full" ? "solid" : "flat"}
                    onPress={() => setScanMode("full")}
                  >
                    Receive All
                  </Button>
                </ButtonGroup>
                <Input
                  className="w-full sm:w-64"
                  placeholder="Scan barcode..."
                  startContent={
                    <Package className="w-4 h-4 text-default-400" />
                  }
                  value={scanInput}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleBarcodeScan(scanInput);
                    }
                  }}
                  onValueChange={setScanInput}
                />
              </div>
            </div>

            {selectedIndices.size > 0 && (
              <div className="px-8 py-2">
                <BulkActionBar
                  actions={[
                    {
                      label: "Mark Received",
                      action: "receive_all",
                      color: "success",
                    },
                  ]}
                  isLoading={isBulkLoading}
                  selectedCount={selectedIndices.size}
                  onAction={handleBulkAction}
                />
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-default-50/50">
                    <th className="py-4 px-6 w-12 text-center">
                      <Checkbox
                        isIndeterminate={
                          selectedIndices.size > 0 &&
                          selectedIndices.size < fields.length
                        }
                        isSelected={
                          fields.length > 0 &&
                          selectedIndices.size === fields.length
                        }
                        onValueChange={toggleSelectAll}
                      />
                    </th>
                    <th className="py-4 px-6 font-semibold text-sm">
                      Product Details
                    </th>
                    <th className="py-4 px-6 font-semibold text-sm text-center">
                      Shipped Qty
                    </th>
                    <th className="py-4 px-6 font-semibold text-sm text-center w-48">
                      Received Qty
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => {
                    const item = watchItems[index];
                    const originalItem = initialData.stock_transfer_items?.find(
                      (i: any) => i.id === item.id,
                    );
                    const maxQty =
                      originalItem?.approved_quantity ?? originalItem?.quantity;

                    return (
                      <tr
                        key={field.id}
                        className={`border-b hover:bg-default-50/50 ${selectedIndices.has(index) ? "bg-primary-50/50" : ""}`}
                      >
                        <td className="py-4 px-6 text-center">
                          <Checkbox
                            isSelected={selectedIndices.has(index)}
                            onValueChange={() => toggleSelect(index)}
                          />
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1">
                          <span className="font-semibold text-sm">
                            {item.variant?.product?.name}
                          </span>
                          <span className="text-xs text-default-500">
                            {getFullVariantName(
                              item.variant?.name,
                              item.variant?.value,
                            )}
                          </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="font-medium text-lg">{maxQty}</span>
                          <span className="text-default-400 text-xs ml-1">
                            {item.unit_of_measure?.abbreviation}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <Input
                            size="sm"
                            type="number"
                            variant="bordered"
                            {...register(
                              `items.${index}.received_quantity` as const,
                            )}
                            classNames={{
                              input: "text-center pr-8 font-bold",
                              inputWrapper: "h-10",
                            }}
                            endContent={
                              <span className="text-default-400 text-xs">
                                {item.variant?.unit_abbreviation}
                              </span>
                            }
                            onBlur={() =>
                              updateItemApi(index, {
                                received_quantity: item.received_quantity,
                              })
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </form>
    </div>
  );
}
