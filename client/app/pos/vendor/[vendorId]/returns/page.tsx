"use client";

import { useState, useCallback, useEffect } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { SortDescriptor } from "@heroui/table";
import { Plus, ChevronDown, Trash2 } from "lucide-react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Selection } from "@heroui/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@heroui/modal";
import { toast } from "sonner";

import ReturnForm from "./_components/ReturnForm";

import { SearchIcon } from "@/components/icons";
import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import CustomTable, { Column } from "@/components/ui/CustomTable";
import api from "@/lib/api";
import { SaleReturn } from "@/lib/types/general";
import { formatDateTime } from "@/lib/helper/dates";
import Confirm from "@/components/ui/Confirm";
import { UserLoding } from "@/components/user-loding";

const columns: Column[] = [
  { name: "RETURN ID", uid: "id", sortable: true },
  { name: "SALE ID", uid: "original_sale_id", sortable: true },
  { name: "REASON", uid: "reason", sortable: true },
  { name: "TOTAL REFUNDED", uid: "refund_amount", sortable: true },
  { name: "CREATED AT", uid: "created_at", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "original_sale_id",
  "reason",
  "refund_amount",
  "created_at",
  "actions",
];

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

export default function ReturnsPage() {
  const {
    vendor,
    isLoading: contextLoading,
    membership,
    selectedBranchIds,
    updateBranchFilter,
  } = useVendor();
  const [items, setItems] = useState<SaleReturn[]>([]);
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

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const fetchItems = async (page: number) => {
    if (!vendor?.id) return;
    setLoading(true);
    try {
      const response: any = await api.get(`/sale-returns`, {
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
      console.error("Failed to fetch sale returns:", error);
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
      await api.delete(`/sale-returns/${id}`);
      toast.success("Return record deleted successfully");
      fetchItems(currentPage);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete return record",
      );
    }
    setDeleteConfirmOpen(false);
  };

  const renderCell = useCallback((item: SaleReturn, columnKey: React.Key) => {
    switch (columnKey) {
      case "created_at":
        return formatDateTime(item.created_at);
      case "refund_amount":
        return typeof item.refund_amount === "number"
          ? item.refund_amount.toFixed(2)
          : item.refund_amount;
      case "actions":
        return (
          <div className="flex items-center justify-end gap-2">
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
        return (item as any)[columnKey as keyof SaleReturn];
    }
  }, []);

  if (contextLoading) return <UserLoding />;

  return (
    <PermissionGuard permission="can_process_returns">
      <div className="p-6">
        <PageHeader
          description="Manage sales returns and refunds"
          title="Returns"
        >
          <Button
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onPress={onOpen}
          >
            Process Return
          </Button>
        </PageHeader>

        <div className="flex justify-between gap-3 items-end mb-4">
          <Input
            isClearable
            classNames={{ base: "w-full sm:max-w-[44%]" }}
            placeholder="Search returns..."
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

        <Modal isOpen={isOpen} size="2xl" onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>Process Sale Return</ModalHeader>
                <ModalBody>
                  <ReturnForm
                    onCancel={onClose}
                    onSuccess={() => {
                      onClose();
                      fetchItems(currentPage);
                    }}
                  />
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>

        <Confirm
          isOpen={deleteConfirmOpen}
          message="Are you sure you want to delete this return record?"
          title="Delete Return"
          onConfirm={(id) => handleDelete(id as number)}
          onConfirmProp={deleteConfirmId || ""}
          onOpenChange={setDeleteConfirmOpen}
        />
      </div>
    </PermissionGuard>
  );
}
