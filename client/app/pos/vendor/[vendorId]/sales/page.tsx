"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { SortDescriptor } from "@heroui/table";
import { Plus, ChevronDown, Trash2, Eye } from "lucide-react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@heroui/dropdown";
import { Selection, Chip } from "@heroui/react";
import { toast } from "sonner";

import ReceiptModal from "../pos/_components/ReceiptModal";

import SaleDetailModal from "./_components/SaleDetailModal";

import { SearchIcon } from "@/components/icons";
import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import CustomTable, { Column } from "@/components/ui/CustomTable";
import api from "@/lib/api";
import { Sale, PaymentMethod } from "@/lib/types/general";
import { formatDateTime } from "@/lib/helper/dates";
import Confirm from "@/components/ui/Confirm";
import { UserLoding } from "@/components/user-loding";

const columns: Column[] = [
  { name: "SALE ID", uid: "id", sortable: true },
  { name: "CUSTOMER", uid: "customer", sortable: false },
  { name: "BRANCH", uid: "branch", sortable: false },
  { name: "SALESPERSON", uid: "sales_person", sortable: false },
  { name: "ITEMS", uid: "items_count", sortable: false },
  { name: "SUBTOTAL", uid: "subtotal_amount", sortable: true },
  { name: "DISCOUNT", uid: "total_discount_amount", sortable: true },
  { name: "TAX", uid: "tax_amount", sortable: true },
  { name: "TOTAL", uid: "final_amount", sortable: true },
  { name: "PAYMENT", uid: "payment_methods", sortable: false },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "DATE", uid: "created_at", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "customer",
  "branch",
  "sales_person",
  "items_count",
  "final_amount",
  "payment_methods",
  "status",
  "created_at",
  "actions",
];

const STATUS_OPTIONS = [
  { key: "", label: "All Statuses" },
  { key: "completed", label: "Completed" },
  { key: "voided", label: "Voided" },
  { key: "refunded", label: "Refunded" },
];

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

export default function SalesPage() {
  const router = useRouter();
  const {
    vendor,
    isLoading: contextLoading,
    membership,
    selectedBranchIds,
    updateBranchFilter,
  } = useVendor();
  const [items, setItems] = useState<Sale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [searchValue, setSearchValue] = useState<string>("");
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "created_at",
    direction: "descending",
  });
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [salesPersonFilter] = useState<string>("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Detail modal
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Receipt modal
  const [receiptSettings, setReceiptSettings] = useState<any>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const [voidConfirmOpen, setVoidConfirmOpen] = useState<boolean>(false);
  const [voidConfirmId, setVoidConfirmId] = useState<number | null>(null);

  // Fetch receipt settings
  useEffect(() => {
    if (!vendor?.id) return;
    const fetchSettings = async () => {
      try {
        const res: any = await api.get(`/receipt-settings`, {
          params: { vendor_id: vendor.id },
        });

        setReceiptSettings(res.data);
      } catch (e) {
        console.error("Failed to fetch receipt settings", e);
      }
    };

    fetchSettings();
  }, [vendor?.id]);

  // Fetch payment methods for filter dropdown
  useEffect(() => {
    if (!vendor?.id) return;
    const fetchPM = async () => {
      try {
        const res: any = await api.get(`/payment-methods`, {
          params: { vendor_id: vendor.id, per_page: 100 },
        });

        setPaymentMethods(res.data?.data || []);
      } catch (e) {
        console.error("Failed to fetch payment methods", e);
      }
    };

    fetchPM();
  }, [vendor?.id]);

  const fetchItems = async (page: number) => {
    if (!vendor?.id) return;
    setLoading(true);
    try {
      const response: any = await api.get(`/sales`, {
        params: {
          page,
          per_page: perPage,
          vendor_id: vendor.id,
          search: searchValue || undefined,
          sort_by: sortDescriptor.column,
          sort_direction:
            sortDescriptor.direction === "ascending" ? "asc" : "desc",
          branch_ids:
            selectedBranchIds.length > 0 ? selectedBranchIds : undefined,
          status: statusFilter || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          sales_person_id: salesPersonFilter || undefined,
          payment_method_id: paymentMethodFilter || undefined,
        },
      });

      setItems(response?.data?.data || []);
      setCurrentPage(response?.data?.current_page || 1);
      setLastPage(response?.data?.last_page || 1);
    } catch (error: any) {
      console.error("Failed to fetch sales:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendor?.id) {
      fetchItems(currentPage);
    }
  }, [
    vendor?.id,
    currentPage,
    perPage,
    sortDescriptor,
    searchValue,
    selectedBranchIds,
    statusFilter,
    dateFrom,
    dateTo,
    salesPersonFilter,
    paymentMethodFilter,
  ]);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/sales/${id}`);
      toast.success("Sale deleted successfully");
      fetchItems(currentPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete sale");
    }
    setDeleteConfirmOpen(false);
  };

  const handleVoid = async (id: number) => {
    try {
      await api.post(`/sales/${id}/void`);
      toast.success("Sale voided successfully");
      setIsDetailOpen(false);
      fetchItems(currentPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to void sale");
    }
    setVoidConfirmOpen(false);
  };

  const statusColor: Record<
    string,
    "success" | "danger" | "warning" | "default"
  > = {
    completed: "success",
    voided: "danger",
    refunded: "warning",
  };

  const pmTypeColor: Record<
    string,
    "primary" | "success" | "secondary" | "warning" | "default"
  > = {
    cash: "success",
    billing_counter: "success",
    card: "primary",
    online: "secondary",
    other: "default",
  };

  const fmt = (val: string | number) =>
    Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });

  const renderCell = useCallback((item: Sale, columnKey: React.Key) => {
    switch (columnKey) {
      case "customer":
        if (!item.customer)
          return <span className="text-default-400">Walk-in</span>;

        return (
          item.customer.name ||
          `${item.customer.first_name || ""} ${item.customer.last_name || ""}`.trim()
        );
      case "branch":
        return item.branch?.name || "—";
      case "sales_person":
        return item.sales_person?.name || "—";
      case "items_count":
        return (
          <Chip color="default" size="sm" variant="flat">
            {item.sale_items?.length || 0}
          </Chip>
        );
      case "subtotal_amount":
        return fmt(item.subtotal_amount);
      case "total_discount_amount":
        return Number(item.total_discount_amount) > 0 ? (
          <span className="text-danger">
            -{fmt(item.total_discount_amount)}
          </span>
        ) : (
          <span className="text-default-300">—</span>
        );
      case "tax_amount":
        return Number(item.tax_amount) > 0 ? (
          fmt(item.tax_amount)
        ) : (
          <span className="text-default-300">—</span>
        );
      case "final_amount":
        return <span className="font-bold">{fmt(item.final_amount)}</span>;
      case "payment_methods": {
        const payments = item.sale_payments || [];

        if (payments.length === 0) return "—";

        return (
          <div className="flex gap-1 flex-wrap">
            {payments.map((p, i) => (
              <Chip
                key={i}
                className="text-[10px]"
                color={
                  pmTypeColor[p.payment_method?.type || "other"] || "default"
                }
                size="sm"
                variant="flat"
              >
                {p.payment_method?.name || "Payment"}
              </Chip>
            ))}
          </div>
        );
      }
      case "status":
        return (
          <Chip
            className="font-bold uppercase"
            color={statusColor[item.status] || "default"}
            size="sm"
            variant="flat"
          >
            {item.status}
          </Chip>
        );
      case "created_at":
        return formatDateTime(item.created_at);
      case "actions":
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => {
                setSelectedSale(item);
                setIsDetailOpen(true);
              }}
            >
              <Eye className="w-4 h-4 text-primary" />
            </Button>
            {membership?.role.can_manage_sales && (
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => {
                  setDeleteConfirmId(item.id);
                  setDeleteConfirmOpen(true);
                }}
              >
                <Trash2 className="w-4 h-4 text-danger" />
              </Button>
            )}
          </div>
        );
      default:
        return (item as any)[columnKey as keyof Sale];
    }
  }, []);

  if (contextLoading) return <UserLoding />;

  return (
    <PermissionGuard permission="can_use_pos">
      <div className="p-6">
        <PageHeader
          description="View and manage sales transactions"
          title="Sales History"
        >
          <Button
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onPress={() => router.push(`/pos/vendor/${vendor?.id}/pos`)}
          >
            New Sale
          </Button>
        </PageHeader>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-3 items-end mb-4">
          <Input
            isClearable
            classNames={{ base: "w-full sm:max-w-[200px]" }}
            placeholder="Search sales..."
            size="sm"
            startContent={<SearchIcon />}
            value={searchValue}
            onValueChange={setSearchValue}
          />

          {/* Branch Filter */}
          <Dropdown radius="sm">
            <DropdownTrigger className="flex">
              <Button
                endContent={<ChevronDown className="text-small" />}
                size="sm"
                variant="flat"
              >
                Branch:{" "}
                {selectedBranchIds.length === 0
                  ? "All"
                  : `${selectedBranchIds.length}`}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Filter by Branch"
              closeOnSelect={false}
              disallowEmptySelection={false}
              selectedKeys={new Set(selectedBranchIds)}
              selectionMode="multiple"
              onSelectionChange={(keys) => {
                const ids = Array.from(keys as Set<string>);

                updateBranchFilter(ids);
              }}
            >
              {membership?.user_branch_assignments?.map((assignment) => (
                <DropdownItem key={String(assignment.branch.id)}>
                  {assignment.branch.name}
                </DropdownItem>
              )) || []}
            </DropdownMenu>
          </Dropdown>

          {/* Status Filter */}
          <Dropdown radius="sm">
            <DropdownTrigger>
              <Button
                endContent={<ChevronDown className="text-small" />}
                size="sm"
                variant="flat"
              >
                Status: {statusFilter ? capitalize(statusFilter) : "All"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Filter by Status"
              selectedKeys={new Set([statusFilter])}
              selectionMode="single"
              onSelectionChange={(keys) => {
                const val = Array.from(keys as Set<string>)[0] || "";

                setStatusFilter(val);
              }}
            >
              {STATUS_OPTIONS.map((opt) => (
                <DropdownItem key={opt.key}>{opt.label}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          {/* Payment Method Filter */}
          <Dropdown radius="sm">
            <DropdownTrigger>
              <Button
                endContent={<ChevronDown className="text-small" />}
                size="sm"
                variant="flat"
              >
                Payment:{" "}
                {paymentMethodFilter
                  ? paymentMethods.find(
                      (pm) => String(pm.id) === paymentMethodFilter,
                    )?.name || "Selected"
                  : "All"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Filter by Payment Method"
              items={[
                { id: "", name: "All Methods" },
                ...paymentMethods.map((pm) => ({
                  id: String(pm.id),
                  name: pm.name,
                })),
              ]}
              selectedKeys={new Set([paymentMethodFilter])}
              selectionMode="single"
              onSelectionChange={(keys) => {
                const val = Array.from(keys as Set<string>)[0] || "";

                setPaymentMethodFilter(val);
              }}
            >
              {(item: any) => (
                <DropdownItem key={item.id}>{item.name}</DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>

          {/* Date Range */}
          <Input
            classNames={{ base: "w-auto", label: "text-xs" }}
            label="From"
            labelPlacement="outside-left"
            size="sm"
            type="date"
            value={dateFrom}
            onValueChange={setDateFrom}
          />
          <Input
            classNames={{ base: "w-auto", label: "text-xs" }}
            label="To"
            labelPlacement="outside-left"
            size="sm"
            type="date"
            value={dateTo}
            onValueChange={setDateTo}
          />

          {/* Columns Selector */}
          <div className="ml-auto">
            <Dropdown radius="sm">
              <DropdownTrigger className="flex">
                <Button
                  endContent={<ChevronDown className="text-small" />}
                  size="sm"
                  variant="flat"
                >
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <CustomTable
          columns={columns}
          currentPage={currentPage}
          isLoading={loading}
          items={items}
          lastPage={lastPage}
          perPage={perPage}
          renderCell={renderCell}
          setCurrentPage={setCurrentPage}
          setPerPage={setPerPage}
          setSortDescriptor={setSortDescriptor}
          sortDescriptor={sortDescriptor}
          visibleColumns={visibleColumns}
        />

        <SaleDetailModal
          currencySymbol={vendor?.settings?.currency_symbol || "৳"}
          isOpen={isDetailOpen}
          sale={selectedSale}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedSale(null);
          }}
          onPrintReceipt={(sale) => {
            setSelectedSale(sale);
            setIsReceiptOpen(true);
          }}
          onVoid={(sale) => {
            setVoidConfirmId(sale.id);
            setVoidConfirmOpen(true);
          }}
        />

        <ReceiptModal
          autoPrint={true}
          currencySymbol={vendor?.settings?.currency_symbol || "৳"}
          isOpen={isReceiptOpen}
          receiptSettings={receiptSettings}
          saleData={selectedSale}
          vendor={vendor}
          onClose={() => {
            setIsReceiptOpen(false);
          }}
        />

        <Confirm
          isOpen={deleteConfirmOpen}
          message="Are you sure you want to delete this sale record?"
          title="Delete Sale"
          onConfirm={(id) => handleDelete(id as number)}
          onConfirmProp={deleteConfirmId || ""}
          onOpenChange={setDeleteConfirmOpen}
        />

        <Confirm
          isOpen={voidConfirmOpen}
          message="Are you sure you want to void this sale? This action will reverse stock deductions and payment amounts."
          title="Void Sale"
          onConfirm={(id) => handleVoid(id as number)}
          onConfirmProp={voidConfirmId || ""}
          onOpenChange={setVoidConfirmOpen}
        />
      </div>
    </PermissionGuard>
  );
}
