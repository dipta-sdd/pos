"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Checkbox,
} from "@heroui/react";
import BulkActionBar from "./BulkActionBar";
import { useEffect, useState } from "react";
import { Clock, User, Edit2, Package } from "lucide-react";

import StockSelectionModal from "./StockSelectionModal";

import { formatDate } from "@/lib/helper/dates";
import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import { StockTransfer } from "@/lib/types/general";
import { getFullVariantName } from "@/lib/helper/variant";

interface AcceptedSendingTransferFormProps {
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
      product_stocks_id: z.number().nullable().optional(),
      approved_quantity: z.coerce.number().nullable().optional(),
      cost_price: z.coerce.number().nullable().optional(),
      selling_price: z.coerce.number().nullable().optional(),
      expiry_date: z.string().nullable().optional(),
      status: z.string(),
      variant: z.any().optional(),
      unit_of_measure: z.any().optional(),
    }),
  ),
});

type TransferFormData = z.infer<typeof transferSchema>;

export default function AcceptedSendingTransferForm({
  initialData,
  setInitialData,
}: AcceptedSendingTransferFormProps) {
  const { vendor } = useVendor();
  const router = useRouter();

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockModalItemIndex, setStockModalItemIndex] = useState<number | null>(
    null,
  );
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const { handleSubmit, control, setValue, watch, reset } =
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
            approved_quantity: i.approved_quantity,
            cost_price: i.cost_price,
            selling_price: i.selling_price,
            expiry_date: i.expiry_date,
            status: i.status || "accepted",
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
            approved_quantity: i.approved_quantity,
            cost_price: i.cost_price,
            selling_price: i.selling_price,
            expiry_date: i.expiry_date,
            status: i.status || "accepted",
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

  const handleStockSelectionConfirm = async (
    index: number,
    stock: any,
    approvedQuantity: number,
  ) => {
    setValue(`items.${index}.product_stocks_id`, stock.id);
    setValue(`items.${index}.approved_quantity`, approvedQuantity);
    setValue(`items.${index}.cost_price`, stock.cost_price);
    setValue(`items.${index}.selling_price`, stock.selling_price);
    setValue(`items.${index}.expiry_date`, stock.expiry_date);
    setValue(`items.${index}.status`, "accepted");

    await updateItemApi(index, {
      product_stocks_id: stock.id,
      approved_quantity: approvedQuantity,
      cost_price: stock.cost_price,
      selling_price: stock.selling_price,
      expiry_date: stock.expiry_date,
      status: "accepted",
    });
  };

  const markItemOutOfStock = async (index: number) => {
    setValue(`items.${index}.status`, "out_of_stock");
    setValue(`items.${index}.approved_quantity`, 0);
    await updateItemApi(index, {
      status: "out_of_stock",
      approved_quantity: 0,
    });
    toast.success("Item marked out of stock");
  };


  const handleBulkAction = async (action: string) => {
    const indices = Array.from(selectedIndices);
    setIsBulkLoading(true);

    try {
      if (action === "out_of_stock") {
        await Promise.all(
          indices.map(async (index) => {
            const item = watchItems[index];
            setValue(`items.${index}.status`, "out_of_stock");
            setValue(`items.${index}.approved_quantity`, 0);
            await api.put(`/stock-transfers/items/${item.id}`, {
              status: "out_of_stock",
              approved_quantity: 0,
            });
          }),
        );
        toast.success("Items marked as out of stock");
      }
      setSelectedIndices(new Set());
    } catch (error) {
      toast.error("Bulk action failed");
    } finally {
      setIsBulkLoading(false);
    }
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

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Prepare Shipment ST-{initialData.id}
            </h1>
            <Chip color="primary" variant="flat">
              Accepted
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
            color="danger"
            variant="flat"
            onPress={() => updateGlobalStatus("cancelled")}
          >
            Cancel Transfer
          </Button>
          <Button
            color="secondary"
            onPress={() => updateGlobalStatus("in_transit")}
          >
            Ship Transfer
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
            {initialData.notes && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-default-500 mb-1">Notes</p>
                <p className="text-sm">{initialData.notes}</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <CardBody className="p-0">
          <div className="p-6 border-b bg-default-50/50">
            <h3 className="font-semibold text-lg">Approved Items</h3>
            <p className="text-sm text-default-500">
              Finalize items before shipping. You can adjust approved quantities
              if stock levels changed.
            </p>
          </div>

          {selectedIndices.size > 0 && (
            <div className="px-6 py-2">
              <BulkActionBar
                actions={[
                  {
                    label: "Mark Out of Stock",
                    action: "out_of_stock",
                    color: "danger",
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
                      isSelected={
                        fields.length > 0 &&
                        selectedIndices.size === fields.length
                      }
                      isIndeterminate={
                        selectedIndices.size > 0 &&
                        selectedIndices.size < fields.length
                      }
                      onValueChange={toggleSelectAll}
                    />
                  </th>
                  <th className="py-4 px-6 font-semibold text-sm">
                    Product Details
                  </th>
                  <th className="py-4 px-6 font-semibold text-sm text-center">
                    Requested Qty
                  </th>
                  <th className="py-4 px-6 font-semibold text-sm text-center">
                    Approved Qty
                  </th>
                  <th className="py-4 px-6 font-semibold text-sm text-center">
                    Status
                  </th>
                  <th className="py-4 px-6 font-semibold text-sm text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => {
                  const item = watchItems[index];
                  const isOutOfStock = item.status === "out_of_stock";

                  return (
                    <tr
                      key={field.id}
                      className={`border-b hover:bg-default-50/50 ${isOutOfStock ? "opacity-50" : ""} ${selectedIndices.has(index) ? "bg-primary-50/50" : ""}`}
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
                        <span className="font-medium text-lg">
                          {item.quantity}
                        </span>
                        <span className="text-default-400 text-xs ml-1">
                          {item.unit_of_measure?.abbreviation}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {isOutOfStock ? (
                          <span className="text-danger font-medium">—</span>
                        ) : (
                          <div className="flex items-center justify-center gap-2 text-success-600">
                            <span className="font-bold text-lg">
                              {item.approved_quantity || 0}
                            </span>
                            <span className="text-xs">
                              {item.unit_of_measure?.abbreviation}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Chip
                          color={isOutOfStock ? "danger" : "success"}
                          size="sm"
                          variant="flat"
                        >
                          {isOutOfStock ? "Out of Stock" : "Approved"}
                        </Chip>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Dropdown>
                          <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu>
                            <DropdownItem
                              startContent={<Package className="w-4 h-4" />}
                              onPress={() => {
                                setStockModalItemIndex(index);
                                setIsStockModalOpen(true);
                              }}
                              key="edit"
                            >
                              Edit Stock/Qty
                            </DropdownItem>
                            <DropdownItem
                              className="text-danger"
                              color="danger"
                              onPress={() => markItemOutOfStock(index)}
                              key="out_of_stock"
                            >
                              Mark Out of Stock
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {stockModalItemIndex !== null && (
        <StockSelectionModal
          branchId={initialData.from_branch_id}
          isOpen={isStockModalOpen}
          requestedQuantity={Number(watchItems[stockModalItemIndex].quantity)}
          variantId={watchItems[stockModalItemIndex].variant_id}
          onClose={() => setIsStockModalOpen(false)}
          onConfirm={(stock, approvedQuantity) =>
            handleStockSelectionConfirm(
              stockModalItemIndex,
              stock,
              approvedQuantity,
            )
          }
        />
      )}
    </div>
  );
}
