"use client";

import { useState, useCallback, useEffect } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { SortDescriptor } from "@heroui/table";
import { ChevronDown, Wallet, Trash2, Search } from "lucide-react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Selection } from "@heroui/react";
import { useDisclosure } from "@heroui/modal";
import { toast } from "sonner";

import RegisterStatusModal from "../pos/_components/RegisterStatusModal";

import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import CustomTable, { Column } from "@/components/ui/CustomTable";
import api from "@/lib/api";
import { CashRegisterSession } from "@/lib/types/general";
import { formatDateTime } from "@/lib/helper/dates";
import Confirm from "@/components/ui/Confirm";
import { UserLoding } from "@/components/user-loding";

const columns: Column[] = [
  { name: "SESSION ID", uid: "id", sortable: true },
  { name: "OPENED BY", uid: "user", sortable: false },
  { name: "OPENED AT", uid: "started_at", sortable: true },
  { name: "CLOSED AT", uid: "ended_at", sortable: true },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "user",
  "started_at",
  "ended_at",
  "status",
  "actions",
];

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

export default function CashManagementPage() {
  const {
    vendor,
    isLoading: contextLoading,
    membership,
    selectedBranchIds,
    updateBranchFilter,
  } = useVendor();
  const [items, setItems] = useState<CashRegisterSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [searchValue, setSearchValue] = useState<string>("");
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "started_at",
    direction: "descending",
  });
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState<CashRegisterSession | null>(
    null,
  );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const fetchItems = async (page: number) => {
    if (!vendor?.id) return;
    setLoading(true);
    try {
      const response: any = await api.get(`/cash-register-sessions`, {
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
      console.error("Failed to fetch cash sessions:", error);
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
      await api.delete(`/cash-register-sessions/${id}`);
      toast.success("Session deleted successfully");
      fetchItems(currentPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete session");
    }
    setDeleteConfirmOpen(false);
  };

  const renderCell = useCallback(
    (item: CashRegisterSession, columnKey: React.Key) => {
      switch (columnKey) {
        case "user":
          return item.user?.name || "N/A";
        case "started_at":
          return formatDateTime(item.started_at);
        case "ended_at":
          return item.ended_at ? formatDateTime(item.ended_at) : "N/A";
        case "status":
          return (
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${item.status === "open" ? "bg-success" : "bg-default-400"}`}
              />
              <span
                className={
                  item.status === "open" ? "text-success font-bold" : ""
                }
              >
                {capitalize(item.status)}
              </span>
            </div>
          );
        case "actions":
          return (
            <div className="flex items-center justify-end gap-2">
              {item.status === "open" && (
                <Button
                  color="danger"
                  size="sm"
                  variant="flat"
                  onPress={() => {
                    setSelectedItem(item);
                    onOpen();
                  }}
                >
                  Close Register
                </Button>
              )}
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => {
                  setDeleteConfirmId(item.id);
                  setDeleteConfirmOpen(true);
                }}
              >
                <Trash2 className="w-4 h-4 text-default-400" />
              </Button>
            </div>
          );
        default:
          return (item as any)[columnKey as keyof CashRegisterSession];
      }
    },
    [onOpen],
  );

  const handleOpenRegister = () => {
    setSelectedItem(null);
    onOpen();
  };

  if (contextLoading) return <UserLoding />;

  return (
    <PermissionGuard permission="can_open_close_cash_register">
      <div className="p-6">
        <PageHeader
          description="Open/Close register and track cash sessions"
          title="Cash Management"
        >
          <Button
            className="text-white font-bold"
            color="success"
            startContent={<Wallet className="w-4 h-4" />}
            onPress={handleOpenRegister}
          >
            Open Register
          </Button>
        </PageHeader>

        <div className="flex justify-between gap-3 items-end mb-4">
          <Input
            isClearable
            classNames={{ base: "w-full sm:max-w-[44%]" }}
            placeholder="Search sessions..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
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

        <RegisterStatusModal
          activeSession={selectedItem}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          onSessionChange={() => fetchItems(currentPage)}
        />

        <Confirm
          isOpen={deleteConfirmOpen}
          message="Are you sure you want to delete this session record?"
          title="Delete Session"
          onConfirm={(id) => handleDelete(id as number)}
          onConfirmProp={deleteConfirmId || ""}
          onOpenChange={setDeleteConfirmOpen}
        />
      </div>
    </PermissionGuard>
  );
}
