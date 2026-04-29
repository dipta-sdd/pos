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
  Chip,
  Modal,
  ModalContent,
  ModalBody,
} from "@heroui/react";
import { useEffect, useState, useCallback } from "react";
import {
  ChevronDown,
  MapPin,
  Truck,
  Download,
  Clock,
  User,
  Package,
  Layers,
  ArrowLeft,
  Search,
  Trash2,
  Edit2,
  Check,
} from "lucide-react";
import debounce from "lodash/debounce";
import { formatDate } from "@/lib/helper/dates";

import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import { Variant as BaseVariant, StockTransfer } from "@/lib/types/general";

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
        id: z.number().optional(),
        variant_id: z.coerce.number().min(1, "Product is required"),
        product_stocks_id: z.number().nullable().optional(),
        quantity: z.coerce
          .number()
          .min(0.01, "Quantity must be greater than 0"),
        status: z.string().default("pending"),
        variant: z.any().optional(),
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
  const assignedBranchIds =
    membership?.user_branch_assignments?.map((a) => a.branch_id) || [];

  const [isDetailsEditing, setIsDetailsEditing] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Variant[]>([]);
  const [transferType, setTransferType] = useState<"transfer" | "request">(
    initialData?.status === "requested" ? "request" : "transfer",
  );

  const [actingBranchId, setActingBranchId] = useState<number | null>(null);
  const [showContextModal, setShowContextModal] = useState(false);

  useEffect(() => {
    if (isEditing && initialData && !actingBranchId && !showContextModal) {
      const fromBranchAccessible = assignedBranchIds.includes(
        initialData.from_branch_id,
      );
      const toBranchAccessible = assignedBranchIds.includes(
        initialData.to_branch_id,
      );

      if (fromBranchAccessible && toBranchAccessible) {
        setShowContextModal(true);
      } else if (fromBranchAccessible) {
        setActingBranchId(initialData.from_branch_id);
      } else if (toBranchAccessible) {
        setActingBranchId(initialData.to_branch_id);
      }
    }
  }, [
    isEditing,
    initialData,
    assignedBranchIds,
    actingBranchId,
    showContextModal,
  ]);

  const isSender = actingBranchId === initialData?.from_branch_id;
  const isReceiver = actingBranchId === initialData?.to_branch_id;
  const canEditDetails =
    !isEditing ||
    (isSender && initialData?.status === "pending") ||
    (isReceiver && initialData?.status === "requested");
  const canEditItems =
    !isEditing ||
    (isSender && initialData?.status === "pending") ||
    (isReceiver && initialData?.status === "requested");

  const senderStatuses = ["accepted", "rejected", "in_transit", "out_of_stock"];
  const receiverStatuses = ["completed", "requested", "cancelled"];

  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting },
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
      items:
        initialData?.stock_transfer_items?.map((i: any) => ({
          id: i.id,
          variant_id: i.variant_id,
          product_stocks_id: i.product_stocks_id,
          quantity: i.quantity,
          status: i.status || "pending",
          variant: i.variant,
        })) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchFromBranch = watch("from_branch_id");
  const watchToBranch = watch("to_branch_id");
  const watchItems = watch("items");

  const fromBranches = allBranches.filter((b) =>
    transferType === "transfer" ? assignedBranchIds.includes(b.id) : true,
  );
  const toBranches = allBranches.filter((b) =>
    transferType === "request" ? assignedBranchIds.includes(b.id) : true,
  );

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
              branch_id:
                transferType === "transfer" ? watchFromBranch : undefined,
              search: query,
            },
          },
        );
        setSearchResults(response.data || []);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setSearchLoading(false);
      }
    }, 500),
    [vendor?.id, transferType, watchFromBranch],
  );

  const onAddProduct = (variant: Variant) => {
    const existingIndex = watchItems.findIndex(
      (i) => i.variant_id === variant.id,
    );
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

  const updateGlobalStatus = async (newStatus: string) => {
    if (!initialData) return;
    try {
      await api.post(`/stock-transfers/${initialData.id}/status`, {
        status: newStatus,
      });

      toast.success(`Transfer marked as ${newStatus}`);
      refreshData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update transfer status",
      );
    }
  };

  const refreshData = async () => {
    if (!initialData) return;
    const response: any = await api.get(`/stock-transfers/${initialData.id}`);
    reset({
      ...getValues(),
      status: response.data.status,
      items: response.data.stock_transfer_items.map((i: any) => ({
        id: i.id,
        variant_id: i.variant_id,
        product_stocks_id: i.product_stocks_id,
        quantity: i.quantity,
        status: i.status,
        variant: i.variant,
      })),
    });
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

  const statusLabelMap: any = {
    pending: "Pending Approval",
    accepted: "Accepted",
    in_transit: "In Transit",
    completed: "Completed",
    cancelled: "Cancelled",
    rejected: "Rejected",
    requested: "Requested",
    out_of_stock: "Out of Stock",
  };

  return (
    <div className=" space-y-8 pb-12">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-default-400">
            <button
              type="button"
              onClick={() => router.back()}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" /> Stock Transfers
            </button>
            <span>/</span>
            <span className="text-default-600">
              ST-{initialData?.id || "NEW"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Stock Transfer ST-{initialData?.id || "NEW"}
            </h1>
            {initialData && (
              <Chip
                color={statusColorMap[initialData.status]}
                variant="flat"
                className="font-semibold px-3"
              >
                {statusLabelMap[initialData.status]}
              </Chip>
            )}
          </div>
          {initialData && (
            <p className="text-default-400 text-sm flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Created on {formatDate(initialData.created_at)}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                by Warehouse Admin
              </span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {initialData && (
            <Button
              variant="bordered"
              startContent={<Download className="w-4 h-4" />}
            >
              Download Manifest
            </Button>
          )}
          {isEditing && !isDetailsEditing && canEditDetails && (
            <Button
              variant="bordered"
              startContent={<Edit2 className="w-4 h-4" />}
              onPress={() => setIsDetailsEditing(true)}
            >
              Edit Details
            </Button>
          )}
          {isSender && initialData?.status === "requested" && (
            <Button
              color="primary"
              className="font-semibold shadow-lg shadow-primary/20"
              onPress={() => updateGlobalStatus("accepted")}
            >
              Approve Transfer
            </Button>
          )}
        </div>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
        {/* Branch Context Modal */}
        <Modal
          isOpen={showContextModal}
          isDismissable={false}
          hideCloseButton
          placement="center"
        >
          <ModalContent>
            <ModalBody className="p-8 space-y-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Select Branch Context</h3>
                <p className="text-default-500">
                  You have access to both involved branches. Select which one
                  you are acting as for this session.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  color="primary"
                  variant="flat"
                  className="h-14 font-semibold"
                  onPress={() => {
                    setActingBranchId(initialData!.from_branch_id);
                    setShowContextModal(false);
                  }}
                >
                  Sender (Source)
                </Button>
                <Button
                  color="secondary"
                  variant="flat"
                  className="h-14 font-semibold"
                  onPress={() => {
                    setActingBranchId(initialData!.to_branch_id);
                    setShowContextModal(false);
                  }}
                >
                  Receiver (Dest)
                </Button>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Create Mode Tabs */}
        {!isEditing && (
          <Tabs
            selectedKey={transferType}
            variant="underlined"
            className="border-b"
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

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-sm border-default-100">
            <CardBody className="p-8">
              <p className="text-xs font-bold text-default-400 uppercase tracking-widest mb-6">
                Transfer Route
              </p>

              {isDetailsEditing || !isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Select
                    isRequired
                    isDisabled={isEditing}
                    label="Source Branch"
                    placeholder="Select source"
                    selectedKeys={
                      watchFromBranch ? [String(watchFromBranch)] : []
                    }
                    variant="bordered"
                    onChange={(e) =>
                      setValue("from_branch_id", Number(e.target.value))
                    }
                  >
                    {fromBranches.map((b) => (
                      <SelectItem key={b.id} textValue={b.name}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </Select>

                  <Select
                    isRequired
                    isDisabled={isEditing}
                    label="Destination Branch"
                    placeholder="Select destination"
                    selectedKeys={watchToBranch ? [String(watchToBranch)] : []}
                    variant="bordered"
                    onChange={(e) =>
                      setValue("to_branch_id", Number(e.target.value))
                    }
                  >
                    {toBranches.map((b) => (
                      <SelectItem key={b.id} textValue={b.name}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              ) : (
                <div className="flex items-center justify-between py-4 relative">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">
                        {
                          allBranches.find((b) => b.id === watchFromBranch)
                            ?.name
                        }
                      </h4>
                      <p className="text-default-400 text-sm">Source Branch</p>
                    </div>
                  </div>

                  <div className="flex-1 px-8 relative hidden md:block">
                    <div className="absolute top-1/2 left-0 right-0 h-px border-t border-dashed border-default-200 -translate-y-1/2" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4">
                      <Truck className="w-6 h-6 text-default-300" />
                    </div>
                  </div>

                  <div className="flex items-start gap-4 flex-1 justify-end text-right">
                    <div>
                      <h4 className="text-xl font-bold">
                        {allBranches.find((b) => b.id === watchToBranch)?.name}
                      </h4>
                      <p className="text-default-400 text-sm">
                        Destination Branch
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-success/5 flex items-center justify-center border border-success/10">
                      <Package className="w-6 h-6 text-success" />
                    </div>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          <Card className="shadow-sm border-default-100">
            <CardBody className="p-8 space-y-6">
              <p className="text-xs font-bold text-default-400 uppercase tracking-widest">
                Transfer Summary
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-default-500">
                    <Layers className="w-4 h-4" />
                    <span>Total Items</span>
                  </div>
                  <span className="font-bold text-lg">
                    {watchItems.length} Line Items
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-default-500">
                    <Package className="w-4 h-4" />
                    <span>Total Quantity</span>
                  </div>
                  <span className="font-bold text-lg">
                    {watchItems.reduce(
                      (acc, curr) => acc + Number(curr.quantity),
                      0,
                    )}{" "}
                    Units
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-default-50">
                  <span className="text-default-500">Priority Level</span>
                  <Chip
                    size="sm"
                    color="primary"
                    variant="flat"
                    className="font-bold"
                  >
                    STANDARD
                  </Chip>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="lg:col-span-3 shadow-sm border-default-100 overflow-hidden">
            <CardBody className="p-0">
              <div className="p-8 border-b border-default-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">Transfer Items</h3>
                  <p className="text-default-400 text-sm">
                    Showing {watchItems.length} results
                  </p>
                </div>

                {!isEditing || canEditItems ? (
                  <Autocomplete
                    className="max-w-md"
                    isLoading={searchLoading}
                    items={searchResults}
                    placeholder="Search Products to Add..."
                    variant="bordered"
                    onInputChange={handleSearch}
                    onSelectionChange={(id) => {
                      const variant = searchResults.find(
                        (v) => v.id === Number(id),
                      );
                      if (variant) onAddProduct(variant);
                    }}
                    startContent={
                      <Search className="w-4 h-4 text-default-400" />
                    }
                  >
                    {(item) => (
                      <AutocompleteItem
                        key={item.id}
                        textValue={item.product_name}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{item.product_name}</p>
                            <p className="text-tiny text-default-400">
                              {item.variant_name} ({item.sku})
                            </p>
                          </div>
                          <span className="text-tiny bg-default-100 px-2 py-1 rounded">
                            Stock: {item.total_quantity || 0}
                          </span>
                        </div>
                      </AutocompleteItem>
                    )}
                  </Autocomplete>
                ) : null}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-0">
                  <thead>
                    <tr>
                      <th className="bg-default-50 py-4 px-8 font-bold text-default-500 uppercase tracking-wider text-xs border-b border-default-100">
                        ITEM NAME
                      </th>
                      <th className="bg-default-50 py-4 px-4 font-bold text-default-500 uppercase tracking-wider text-xs border-b border-default-100">
                        BATCH NO.
                      </th>
                      <th className="bg-default-50 py-4 px-4 font-bold text-default-500 uppercase tracking-wider text-xs border-b border-default-100">
                        TRANSFER QUANTITY
                      </th>
                      <th className="bg-default-50 py-4 px-4 font-bold text-default-500 uppercase tracking-wider text-xs border-b border-default-100">
                        UNIT
                      </th>
                      <th className="bg-default-50 py-4 px-4 font-bold text-default-500 uppercase tracking-wider text-xs border-b border-default-100">
                        ITEM STATUS
                      </th>
                      {(!isEditing || canEditItems) && (
                        <th className="bg-default-50 py-4 px-8 font-bold text-default-500 uppercase tracking-wider text-xs border-b border-default-100 text-center">
                          ACTIONS
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {fields.length === 0 ? (
                      <tr>
                        <td
                          colSpan={!isEditing || canEditItems ? 6 : 5}
                          className="py-20 text-center text-default-400"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Package className="w-10 h-10 opacity-20" />
                            <p>No items added yet.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      fields.map((field, index) => {
                        const item = watchItems[index];
                        const isEditingRow = editingRowIndex === index;

                        return (
                          <tr
                            key={field.id}
                            className="group hover:bg-default-50/50 transition-colors"
                          >
                            <td className="py-5 px-8 border-b border-default-50">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-default-100 flex items-center justify-center overflow-hidden border border-default-200 group-hover:border-primary/20 transition-colors">
                                  <Package className="w-6 h-6 text-default-400 group-hover:text-primary transition-colors" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-lg text-default-800">
                                    {item.variant?.product_name ||
                                      item.variant?.product?.name}
                                  </span>
                                  <span className="text-xs text-default-400 uppercase tracking-tight font-medium">
                                    SKU: {item.variant?.sku}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-5 px-4 border-b border-default-50">
                              <span className="font-mono text-sm text-default-500 bg-default-100 px-2 py-1 rounded">
                                BTCH-{(item.variant_id * 123) % 1000}
                              </span>
                            </td>
                            <td className="py-5 px-4 border-b border-default-50">
                              {isEditingRow ? (
                                <Input
                                  autoFocus
                                  size="sm"
                                  type="number"
                                  variant="bordered"
                                  className="w-32"
                                  {...register(
                                    `items.${index}.quantity` as const,
                                  )}
                                />
                              ) : (
                                <span className="text-xl font-black text-default-700">
                                  {item.quantity}
                                </span>
                              )}
                            </td>
                            <td className="py-5 px-4 border-b border-default-50">
                              <span className="text-default-500 font-medium italic">
                                Units
                              </span>
                            </td>
                            <td className="py-5 px-4 border-b border-default-50">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-2 h-2 rounded-full ${item.status === "pending" ? "bg-warning" : "bg-success shadow-[0_0_8px_rgba(25,135,84,0.4)]"}`}
                                />
                                <span className="text-sm font-semibold text-default-600 capitalize">
                                  {item.status}
                                </span>
                              </div>
                            </td>
                            {(!isEditing || canEditItems) && (
                              <td className="py-5 px-8 border-b border-default-50 text-center">
                                <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {isEditingRow ? (
                                    <Button
                                      isIconOnly
                                      size="sm"
                                      color="success"
                                      variant="flat"
                                      onPress={() => setEditingRowIndex(null)}
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                  ) : (
                                    <Button
                                      isIconOnly
                                      size="sm"
                                      variant="flat"
                                      className="text-default-400"
                                      onPress={() => setEditingRowIndex(index)}
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button
                                    isIconOnly
                                    size="sm"
                                    variant="flat"
                                    className="text-danger"
                                    onPress={() => remove(index)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          {/* Activity History Timeline */}
          {initialData && (
            <Card className="lg:col-span-3 shadow-sm border-default-100">
              <CardBody className="p-8 space-y-8">
                <p className="text-xs font-bold text-default-400 uppercase tracking-widest">
                  Activity History
                </p>
                <div className="space-y-8 pl-4 border-l-2 border-default-100 ml-2">
                  <div className="relative">
                    <div className="absolute -left-[26px] top-1 w-4 h-4 rounded-full bg-primary ring-4 ring-primary/20" />
                    <div className="space-y-1">
                      <p className="font-bold text-lg">
                        Transfer Request Created
                      </p>
                      <p className="text-sm text-default-400 flex items-center gap-2">
                        {formatDate(initialData.created_at)} by Warehouse Admin
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[26px] top-1 w-4 h-4 rounded-full bg-default-200" />
                    <div className="space-y-1 opacity-50">
                      <p className="font-bold text-lg">
                        Awaiting Authorization
                      </p>
                      <p className="text-sm text-default-400">
                        System is processing the transfer request...
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Form Actions Footer */}
        {(!isEditing || isDetailsEditing || canEditItems) && (
          <div className="flex justify-end gap-4 pt-6">
            <Button
              size="lg"
              variant="bordered"
              className="px-10"
              onPress={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              size="lg"
              color="primary"
              className="px-10 font-bold shadow-xl shadow-primary/20"
              isLoading={isSubmitting}
              type="submit"
              isDisabled={watchItems.length === 0}
            >
              {isEditing
                ? "Save Changes"
                : transferType === "request"
                  ? "Send Request"
                  : "Initiate Transfer"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
