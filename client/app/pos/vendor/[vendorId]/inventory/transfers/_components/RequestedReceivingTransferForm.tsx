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
  Autocomplete,
  AutocompleteItem,
  Chip,
  Checkbox,
} from "@heroui/react";
import { useEffect, useState, useCallback } from "react";
import { Trash2, Clock, User } from "lucide-react";
import debounce from "lodash/debounce";

import BulkActionBar from "./BulkActionBar";

import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import { SearchVariant as Variant, StockTransfer } from "@/lib/types/general";
import { formatDate } from "@/lib/helper/dates";
import { getFullVariantName } from "@/lib/helper/variant";

interface RequestedReceivingTransferFormProps {
  initialData: StockTransfer;
  setInitialData: React.Dispatch<React.SetStateAction<StockTransfer | null>>;
}

const transferSchema = z.object({
  from_branch_id: z.coerce.number(),
  to_branch_id: z.coerce.number(),
  notes: z.string().optional(),
  status: z.string().default("requested"),
  vendor_id: z.number(),
  items: z
    .array(
      z.object({
        id: z.number().optional(),
        variant_id: z.coerce.number().min(1, "Product is required"),
        quantity: z.coerce
          .number()
          .min(0.01, "Quantity must be greater than 0"),
        status: z.string().default("requested"),
        variant: z.any().optional(),
        unit_of_measure: z.any().optional(),
      }),
    )
    .min(1, "At least one item is required"),
});

type TransferFormData = z.infer<typeof transferSchema>;

export default function RequestedReceivingTransferForm({
  initialData,
  setInitialData,
}: RequestedReceivingTransferFormProps) {
  const { vendor } = useVendor();
  const router = useRouter();

  const [searchResults, setSearchResults] = useState<Variant[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set(),
  );
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const { register, handleSubmit, control, watch, reset } =
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
            status: i.status || "requested",
            variant: {
              ...i.variant,
              product_name: i.variant?.product?.name,
              variant_name: i.variant?.value,
              unit_abbreviation:
                i.unit_of_measure?.abbreviation ||
                i.variant?.unit_of_measure?.abbreviation,
            },
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
            status: i.status || "requested",
            variant: {
              ...i.variant,
              product_name: i.variant?.product?.name,
              variant_name: i.variant?.value,
              unit_abbreviation:
                i.unit_of_measure?.abbreviation ||
                i.variant?.unit_of_measure?.abbreviation,
            },
          })) || [],
      });
    }
  }, [initialData, reset, vendor?.id]);

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchItems = watch("items");

  const handleSearch = useCallback(
    debounce(async (query: string) => {
      if (!query || query.length < 2) {
        setSearchResults([]);

        return;
      }
      setSearchLoading(true);
      try {
        const response: any = await api.get(
          "/stock-transfers/search-variants",
          {
            params: {
              vendor_id: vendor?.id,
              search: query,
            },
          },
        );

        setSearchResults(response.data?.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setSearchLoading(false);
      }
    }, 500),
    [vendor?.id],
  );
  const items = watch("items");
  console.log(items);
  const onAddProduct = (variant: Variant) => {
    const existingIndex = watchItems.findIndex(
      (i) => i.variant_id === variant.id,
    );

    if (existingIndex > -1) {
      toast.info("Product already in list");
      return;
    }
    console.log({
      variant_id: variant.id,
      quantity: 1,
      status: "requested",
      variant: {
        ...variant,
      },
    });
    append({
      variant_id: variant.id,
      quantity: 1,
      status: "requested",
      variant: {
        id: variant.id,
        product_id: variant.product_id,
        name: variant.variant_name,
        value: variant.variant_value,
        sku: variant.sku,
        barcode: variant.barcode,
        product: {
          id: variant.product_id,
          name: variant.product_name,
        } as any,
      },
      unit_of_measure: {
        name: variant.unit_name,
        abbreviation: variant.unit_abbreviation,
        is_decimal_allowed: !!variant.is_decimal_allowed,
      } as any,
    });
  };

  const onSubmit = async (data: any) => {
    try {
      await api.put(`/stock-transfers/${initialData.id}`, data);
      toast.success("Request updated successfully");
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const cancelRequest = async () => {
    try {
      await api.post(`/stock-transfers/${initialData.id}/status`, {
        status: "cancelled",
      });
      toast.success("Request cancelled");
      setInitialData((prev) => ({
        ...(prev as StockTransfer),
        status: "cancelled",
      }));
    } catch (error: any) {
      toast.error("Failed to cancel request");
    }
  };

  const handleBulkAction = async (action: string) => {
    if (action === "delete") {
      const indices = Array.from(selectedIndices).sort((a, b) => b - a);

      setIsBulkLoading(true);
      try {
        await Promise.all(
          indices.map(async (index) => {
            const item = watchItems[index];

            if (item.id) {
              await api.delete(`/stock-transfers/items/${item.id}`);
            }
          }),
        );
        indices.forEach((index) => remove(index));
        setSelectedIndices(new Set());
        toast.success("Selected items removed");
      } catch (error) {
        toast.error("Failed to remove some items");
      } finally {
        setIsBulkLoading(false);
      }
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
              Edit Incoming Request ST-{initialData.id}
            </h1>
            <Chip color="primary" variant="flat">
              Requested
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
          <Button color="danger" variant="flat" onPress={cancelRequest}>
            Cancel Request
          </Button>
          <Button color="primary" onPress={handleSubmit(onSubmit)}>
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm">
          <CardBody className="p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-default-500">
                  Request From (Source)
                </p>
                <p className="font-medium text-lg">
                  {initialData.from_branch?.name}
                </p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-sm text-default-500">
                  Receive At (Destination)
                </p>
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
          <div className="p-8 border-b flex justify-between items-center gap-4">
            <div className="flex-1 max-w-md">
              <Autocomplete
                isLoading={searchLoading}
                placeholder="Search products by name, SKU, or barcode..."
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">🔍</span>
                  </div>
                }
                variant="bordered"
                onInputChange={handleSearch}
              >
                {searchResults.map((variant) => (
                  <AutocompleteItem
                    key={variant.id}
                    textValue={`${variant.product_name} - ${getFullVariantName(
                      variant.variant_name,
                      variant.variant_value,
                    )}`}
                    onPress={() => onAddProduct(variant)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {variant.product_name}
                      </span>
                      <span className="text-xs text-default-500">
                        {getFullVariantName(
                          variant.variant_name,
                          variant.variant_value,
                        )}
                      </span>
                    </div>
                  </AutocompleteItem>
                ))}
              </Autocomplete>
            </div>
          </div>

          {selectedIndices.size > 0 && (
            <div className="px-8 py-2">
              <BulkActionBar
                actions={[
                  {
                    label: "Delete Selected",
                    action: "delete",
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
                  <th className="py-4 px-6 font-semibold text-sm w-48 text-center">
                    Requested Quantity
                  </th>
                  <th className="py-4 px-6 font-semibold text-sm w-24 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {fields.length === 0 ? (
                  <tr>
                    <td
                      className="py-12 text-center text-default-400"
                      colSpan={3}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span>No items in request</span>
                        <span className="text-sm">Search and add products</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  fields.map((field, index) => {
                    const item = watchItems[index];

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
                              {item.variant?.product?.name || (item.variant as any)?.product_name}
                            </span>
                            <span className="text-xs text-default-500">
                              {getFullVariantName(
                                item.variant?.name,
                                item.variant?.value,
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Input
                            size="sm"
                            type="number"
                            variant="bordered"
                            {...register(`items.${index}.quantity` as const)}
                            classNames={{
                              input: "text-center pr-8",
                              inputWrapper: "h-9",
                            }}
                            endContent={
                              <span className="text-default-400 text-xs">
                                {item.unit_of_measure?.abbreviation || (item.variant as any)?.unit_abbreviation}
                              </span>
                            }
                          />
                        </td>
                        <td className="py-4 px-6 text-center">
                          <Button
                            isIconOnly
                            color="danger"
                            size="sm"
                            variant="light"
                            onPress={async () => {
                              if (item.id) {
                                try {
                                  await api.delete(
                                    `/stock-transfers/items/${item.id}`,
                                  );
                                  toast.success("Item removed");
                                } catch (error) {
                                  toast.error("Failed to remove item");

                                  return;
                                }
                              }
                              remove(index);
                              if (selectedIndices.has(index)) {
                                toggleSelect(index);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
