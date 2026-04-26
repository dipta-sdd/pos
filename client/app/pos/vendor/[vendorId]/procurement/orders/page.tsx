"use client";

import { useState, useCallback, useEffect } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { SortDescriptor } from "@heroui/table";
import { Plus, ChevronDown, Edit, Trash2 } from "lucide-react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Selection } from "@heroui/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { SearchIcon } from "@/components/icons";
import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import CustomTable, { Column } from "@/components/ui/CustomTable";
import api from "@/lib/api";
import { PurchaseOrder } from "@/lib/types/general";
import { formatDateTime } from "@/lib/helper/dates";
import Confirm from "@/components/ui/Confirm";
import { UserLoding } from "@/components/user-loding";

const columns: Column[] = [
  { name: "ORDER ID", uid: "id", sortable: true },
  { name: "SUPPLIER", uid: "supplier", sortable: false },
  { name: "TOTAL", uid: "total_amount", sortable: true },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "CREATED AT", uid: "created_at", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "supplier",
  "total_amount",
  "status",
  "created_at",
  "actions",
];

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const {
    vendor,
    isLoading: contextLoading,
    membership,
    selectedBranchIds,
    updateBranchFilter,
  } = useVendor();
  const [items, setItems] = useState<PurchaseOrder[]>([]);
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

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const fetchItems = async (page: number) => {
    if (!vendor?.id) return;
    setLoading(true);
    try {
      const response: any = await api.get(`/purchase-orders`, {
        params: {
          page,
          per_page: perPage,
          vendor_id: vendor.id,
          search: searchValue,
          sort_by: sortDescriptor.column,
          sort_direction:
            sortDescriptor.direction === "ascending" ? "asc" : "desc",
          branch_ids:
            selectedBranchIds.length > 0 ? selectedBranchIds : undefined,
        },
      });

      setItems(response?.data?.data || []);
      setCurrentPage(response?.data?.current_page || 1);
      setLastPage(response?.data?.last_page || 1);
    } catch (error: any) {
      console.error("Failed to fetch purchase orders:", error);
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
  ]);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/purchase-orders/${id}`);
      toast.success("Order deleted successfully");
      fetchItems(currentPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete order");
    }
    setDeleteConfirmOpen(false);
  };

  const renderCell = useCallback(
    (item: PurchaseOrder, columnKey: React.Key) => {
      switch (columnKey) {
        case "supplier":
          return item.supplier?.name || "N/A";
        case "created_at":
          return formatDateTime(item.created_at);
        case "total_amount":
          return typeof item.total_amount === "number"
            ? item.total_amount.toFixed(2)
            : item.total_amount;
        case "actions":
          return (
            <div className="flex items-center justify-end gap-2">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() =>
                  router.push(
                    `/pos/vendor/${vendor?.id}/procurement/orders/${item.id}`,
                  )
                }
              >
                <Edit className="w-4 h-4 text-default-400" />
              </Button>
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
            </div>
          );
        default:
          return (item as any)[columnKey as keyof PurchaseOrder];
      }
    },
    [vendor?.id, router],
  );

  if (contextLoading) return <UserLoding />;

  return (
    <PermissionGuard permission="can_view_operations">
      <div className="p-6">
        <PageHeader
          description="Manage stock procurement orders"
          title="Purchase Orders"
        >
          <Button
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onPress={() =>
              router.push(`/pos/vendor/${vendor?.id}/procurement/orders/new`)
            }
          >
            New Order
          </Button>
        </PageHeader>

        <div className="flex justify-between gap-3 items-end mb-4">
          <Input
            isClearable
            classNames={{ base: "w-full sm:max-w-[44%]" }}
            placeholder="Search orders..."
            startContent={<SearchIcon />}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <div className="flex gap-3">
            <Dropdown radius="sm">
              <DropdownTrigger className="flex">
                <Button
                  endContent={<ChevronDown className="text-small" />}
                  variant="flat"
                >
                  Branch:{" "}
                  {selectedBranchIds.length === 0
                    ? "All"
                    : `${selectedBranchIds.length} Selected`}
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

            <Dropdown radius="sm">
              <DropdownTrigger className="flex">
                <Button
                  endContent={<ChevronDown className="text-small" />}
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

        <Confirm
          isOpen={deleteConfirmOpen}
          message="Are you sure you want to delete this purchase order?"
          title="Delete Order"
          onConfirm={(id) => handleDelete(id as number)}
          onConfirmProp={deleteConfirmId || ""}
          onOpenChange={setDeleteConfirmOpen}
        />
      </div>
    </PermissionGuard>
  );
}
