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
  Textarea,
  Autocomplete,
  AutocompleteItem,
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Selection,
} from "@heroui/react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { 
  Plus, 
  Trash2, 
  Search, 
  Edit2, 
  Check, 
  X, 
  ChevronDown, 
  MoreVertical 
} from "lucide-react";
import debounce from "lodash/debounce";

import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import { Variant as BaseVariant, StockTransfer, StockTransferItem } from "@/lib/types/general";

interface Variant extends BaseVariant {
  product_name: string;
  variant_name: string;
  total_quantity?: number;
}

interface StockTransferFormProps {
  initialData?: StockTransfer;
  isEditing?: boolean;
}

const transferSchema = z.object({
  from_branch_id: z.coerce.number().min(1, "Source branch is required"),
  to_branch_id: z.coerce.number().min(1, "Destination branch is required"),
  notes: z.string().optional(),
  status: z.string().default("pending"),
  vendor_id: z.number(),
  items: z
    .array(
      z.object({
        id: z.number().optional(), // Existing item ID
        variant_id: z.coerce.number().min(1, "Product is required"),
        product_stocks_id: z.number().nullable().optional(),
        quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
        status: z.string().default("pending"),
        variant: z.any().optional(), // For display purposes
      }),
    )
    .min(1, "At least one item is required"),
});

type TransferFormData = z.infer<typeof transferSchema>;

export default function StockTransferForm({
  initialData,
  isEditing = false,
}: StockTransferFormProps) {
  const { vendor, membership } = useVendor();
  const router = useRouter();
  const allBranches = vendor?.branches || [];
  const assignedBranchIds = membership?.user_branch_assignments?.map(a => a.branch_id) || [];
  
  // UI States
  const [isDetailsEditing, setIsDetailsEditing] = useState(!isEditing);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Variant[]>([]);
  const [transferType, setTransferType] = useState<"transfer" | "request">(
    initialData?.status === "requested" ? "request" : "transfer"
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    getValues,
    reset,
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      from_branch_id: initialData?.from_branch_id,
      to_branch_id: initialData?.to_branch_id,
      notes: initialData?.notes || "",
      status: initialData?.status || "pending",
      vendor_id: vendor?.id || 0,
      items: initialData?.stock_transfer_items?.map((i: any) => ({
        id: i.id,
        variant_id: i.variant_id,
        product_stocks_id: i.product_stocks_id,
        quantity: i.quantity,
        status: i.status || "pending",
        variant: i.variant,
      })) || [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "items",
  });

  const watchFromBranch = watch("from_branch_id");
  const watchToBranch = watch("to_branch_id");
  const watchItems = watch("items");

  const fromBranches = allBranches.filter(b => 
    transferType === "transfer" ? assignedBranchIds.includes(b.id) : true
  );
  const toBranches = allBranches.filter(b => 
    transferType === "request" ? assignedBranchIds.includes(b.id) : true
  );

  const handleSearch = useCallback(
    debounce(async (query: string) => {
      if (!query || query.length < 2) {
        setSearchResults([]);
        return;
      }
      setSearchLoading(true);
      try {
        const response: any = await api.get("/stock-transfers/search-variants", {
          params: {
            vendor_id: vendor?.id,
            branch_id: transferType === "transfer" ? watchFromBranch : undefined,
            search: query,
          },
        });
        setSearchResults(response.data || []);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setSearchLoading(false);
      }
    }, 500),
    [vendor?.id, transferType, watchFromBranch]
  );

  const onAddProduct = (variant: Variant) => {
    // Check if variant already exists
    const existingIndex = watchItems.findIndex(i => i.variant_id === variant.id);
    if (existingIndex > -1) {
      toast.info("Product already in list");
      setEditingRowIndex(existingIndex);
      return;
    }

    const newItem = {
      variant_id: variant.id,
      product_stocks_id: null,
      quantity: 1,
      status: transferType === "request" ? "requested" : "pending",
      variant: variant,
    };
    append(newItem);
    setEditingRowIndex(watchItems.length);
  };

  const onBulkStatusUpdate = async (newStatus: string) => {
    if (!isEditing || !initialData) return;
    
    const selectedIds = selectedKeys === "all" 
      ? watchItems.filter(i => i.id).map(i => i.id as number)
      : Array.from(selectedKeys).map(id => Number(id));

    if (selectedIds.length === 0) return;

    try {
      await api.post(`/stock-transfers/${initialData.id}/items/bulk-status`, {
        item_ids: selectedIds,
        status: newStatus
      });
      toast.success(`Updated ${selectedIds.length} items to ${newStatus}`);
      // Refresh form data
      const response: any = await api.get(`/stock-transfers/${initialData.id}`);
      reset({
        ...getValues(),
        items: response.data.stock_transfer_items.map((i: any) => ({
          id: i.id,
          variant_id: i.variant_id,
          product_stocks_id: i.product_stocks_id,
          quantity: i.quantity,
          status: i.status,
          variant: i.variant,
        }))
      });
      setSelectedKeys(new Set([]));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update statuses");
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (transferType === "request") {
        data.status = "requested";
        data.items = data.items.map((item: any) => ({
          ...item,
          status: "requested",
        }));
      }

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

  const filteredItems = useMemo(() => {
    if (statusFilter === "all") return watchItems;
    return watchItems.filter(i => i.status === statusFilter);
  }, [watchItems, statusFilter]);

  const statusColorMap: any = {
    pending: "warning",
    accepted: "primary",
    in_transit: "secondary",
    completed: "success",
    cancelled: "danger",
    rejected: "danger",
    requested: "default",
    out_of_stock: "danger",
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {!isEditing && (
        <Tabs 
          selectedKey={transferType} 
          onSelectionChange={(key) => {
            setTransferType(key as any);
            setValue("from_branch_id", 0);
            setValue("to_branch_id", 0);
          }}
        >
          <Tab key="transfer" title="Initiate Transfer" />
          <Tab key="request" title="Request Stock" />
        </Tabs>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Details Card */}
        <Card className="md:col-span-1 h-fit">
          <CardBody className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Transfer Details</h3>
              {isEditing && !isDetailsEditing && (
                <Button isIconOnly size="sm" variant="light" onPress={() => setIsDetailsEditing(true)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            {isDetailsEditing ? (
              <div className="space-y-4">
                <Select
                  isRequired
                  label="From Branch"
                  selectedKeys={watchFromBranch ? [String(watchFromBranch)] : []}
                  variant="bordered"
                  onChange={(e) => setValue("from_branch_id", Number(e.target.value))}
                >
                  {fromBranches.map((b) => (
                    <SelectItem key={b.id} textValue={b.name}>{b.name}</SelectItem>
                  ))}
                </Select>

                <Select
                  isRequired
                  label="To Branch"
                  selectedKeys={watchToBranch ? [String(watchToBranch)] : []}
                  variant="bordered"
                  onChange={(e) => setValue("to_branch_id", Number(e.target.value))}
                >
                  {toBranches.map((b) => (
                    <SelectItem key={b.id} textValue={b.name}>{b.name}</SelectItem>
                  ))}
                </Select>

                <Textarea
                  label="Notes"
                  placeholder="Optional notes..."
                  variant="bordered"
                  {...register("notes")}
                />
                
                {isEditing && (
                   <div className="flex gap-2">
                      <Button fullWidth size="sm" color="primary" onPress={() => setIsDetailsEditing(false)}>Done</Button>
                   </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-default-500">From</span>
                  <span className="font-medium">{allBranches.find(b => b.id === watchFromBranch)?.name}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-default-500">To</span>
                  <span className="font-medium">{allBranches.find(b => b.id === watchToBranch)?.name}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-default-500">Status</span>
                  <Chip color={statusColorMap[initialData?.status || "pending"]} size="sm" variant="flat">
                    {(initialData?.status || "pending").toUpperCase()}
                  </Chip>
                </div>
                {watch("notes") && (
                  <div>
                    <p className="text-default-500 mb-1">Notes</p>
                    <p>{watch("notes")}</p>
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Right: Items Card */}
        <Card className="md:col-span-2">
          <CardBody className="p-6 space-y-6">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Items</h3>
                <div className="flex gap-2">
                  {isEditing && selectedKeys !== "all" && Array.from(selectedKeys).length > 0 && (
                     <Dropdown>
                        <DropdownTrigger>
                          <Button color="primary" size="sm" variant="flat" endContent={<ChevronDown className="w-4 h-4" />}>
                            Bulk Update ({Array.from(selectedKeys).length})
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu onAction={(key) => onBulkStatusUpdate(key as string)}>
                          <DropdownItem key="accepted">Accept</DropdownItem>
                          <DropdownItem key="in_transit">Ship</DropdownItem>
                          <DropdownItem key="completed">Receive</DropdownItem>
                          <DropdownItem key="out_of_stock">Out of Stock</DropdownItem>
                        </DropdownMenu>
                     </Dropdown>
                   )}
                </div>
              </div>

              {/* Global Search Bar */}
              <Autocomplete
                isLoading={searchLoading}
                items={searchResults}
                label="Search Products to Add"
                placeholder="Type product name or SKU..."
                variant="bordered"
                onInputChange={handleSearch}
                onSelectionChange={(id) => {
                  const variant = searchResults.find(v => v.id === Number(id));
                  if (variant) onAddProduct(variant);
                }}
                startContent={<Search className="w-4 h-4 text-default-400" />}
              >
                {(item) => (
                  <AutocompleteItem key={item.id} textValue={`${item.product_name} - ${item.variant_name}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p>{item.product_name}</p>
                        <p className="text-tiny text-default-400">{item.variant_name} ({item.sku})</p>
                      </div>
                      <span className="text-tiny bg-default-100 px-2 py-1 rounded">Stock: {item.total_quantity || 0}</span>
                    </div>
                  </AutocompleteItem>
                )}
              </Autocomplete>
            </div>

            <Table 
              aria-label="Items Table"
              selectionMode={isEditing ? "multiple" : "none"}
              selectedKeys={selectedKeys}
              onSelectionChange={setSelectedKeys}
              className="mt-4"
            >
              <TableHeader>
                <TableColumn>PRODUCT</TableColumn>
                <TableColumn>QUANTITY</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn align="center">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No items added yet.">
                {fields.map((field, index) => {
                  const isEditingRow = editingRowIndex === index;
                  const item = watchItems[index];

                  return (
                    <TableRow key={field.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{item.variant?.product_name || item.variant?.product?.name}</span>
                          <span className="text-tiny text-default-400">{item.variant?.variant_name || item.variant?.name} ({item.variant?.sku})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isEditingRow ? (
                          <Input
                            autoFocus
                            size="sm"
                            type="number"
                            variant="bordered"
                            className="w-24"
                            {...register(`items.${index}.quantity` as const)}
                          />
                        ) : (
                          <span>{item.quantity}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip color={statusColorMap[item.status] || "default"} size="sm" variant="flat">
                          {item.status.toUpperCase()}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          {isEditingRow ? (
                            <>
                              <Button isIconOnly size="sm" color="success" variant="light" onPress={() => setEditingRowIndex(null)}>
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => remove(index)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button isIconOnly size="sm" variant="light" onPress={() => setEditingRowIndex(index)}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => remove(index)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="flat" onPress={() => router.back()}>Cancel</Button>
        <Button color="primary" isLoading={isSubmitting} type="submit" isDisabled={watchItems.length === 0}>
          {isEditing ? "Save Changes" : (transferType === "request" ? "Send Request" : "Initiate Transfer")}
        </Button>
      </div>
    </form>
  );
}
