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
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@heroui/modal";
import { toast } from "sonner";

import StoreCreditForm from "./_components/StoreCreditForm";

import { SearchIcon } from "@/components/icons";
import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import CustomTable, { Column } from "@/components/ui/CustomTable";
import api from "@/lib/api";
import { formatDateTime } from "@/lib/helper/dates";
import Confirm from "@/components/ui/Confirm";

interface CustomerStoreCredit {
  id: number;
  customer_id: number;
  current_balance: string | number;
  created_at: string;
  updated_at: string;
  customer?: {
    name: string;
    first_name?: string;
    last_name?: string;
  };
}

const columns: Column[] = [
  { name: "CUSTOMER", uid: "customer", sortable: false },
  { name: "BALANCE", uid: "current_balance", sortable: true },
  { name: "UPDATED AT", uid: "updated_at", sortable: true },
  { name: "CREATED AT", uid: "created_at", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = ["customer", "current_balance", "updated_at", "actions"];

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

export default function StoreCreditsPage() {
  const { vendor, isLoading: contextLoading } = useVendor();
  const [items, setItems] = useState<CustomerStoreCredit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [searchValue, setSearchValue] = useState<string>("");
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "updated_at",
    direction: "descending",
  });
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState<CustomerStoreCredit | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const fetchItems = async (page: number) => {
    if (!vendor?.id) return;
    setLoading(true);
    try {
      const response: any = await api.get(`/customer-store-credits`, {
        params: {
          page,
          per_page: perPage,
          vendor_id: vendor.id,
          search: searchValue,
          sort_by: sortDescriptor.column,
          sort_direction:
            sortDescriptor.direction === "ascending" ? "asc" : "desc",
        },
      });

      setItems(response?.data?.data || []);
      setCurrentPage(response?.data?.current_page || 1);
      setLastPage(response?.data?.last_page || 1);
    } catch (error: any) {
      console.error("Failed to fetch store credits:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendor?.id) {
      fetchItems(currentPage);
    }
  }, [vendor?.id, currentPage, perPage, sortDescriptor, searchValue]);

  const handleCreate = () => {
    setSelectedItem(null);
    setIsEditing(false);
    onOpen();
  };

  const handleEdit = (item: CustomerStoreCredit) => {
    setSelectedItem(item);
    setIsEditing(true);
    onOpen();
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/customer-store-credits/${id}`);
      toast.success("Store credit deleted successfully");
      fetchItems(currentPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete store credit");
    }
    setDeleteConfirmOpen(false);
  };

  const renderCell = useCallback((item: CustomerStoreCredit, columnKey: React.Key) => {
    switch (columnKey) {
      case "customer":
        if (!item.customer) return "N/A";
        return item.customer.name || `${item.customer.first_name || ""} ${item.customer.last_name || ""}`.trim() || "N/A";
      case "current_balance":
        return typeof item.current_balance === "number"
          ? item.current_balance.toFixed(2)
          : item.current_balance;
      case "updated_at":
        return formatDateTime(item.updated_at);
      case "created_at":
        return formatDateTime(item.created_at);
      case "actions":
        return (
          <div className="flex items-center justify-end gap-2">
            <Button isIconOnly size="sm" variant="light" onPress={() => handleEdit(item)}>
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
        return (item as any)[columnKey as string];
    }
  }, []);

  if (contextLoading) return <div>Loading...</div>;

  return (
    <PermissionGuard permission="can_issue_store_credit">
      <div className="p-6">
        <PageHeader
          description="Manage customer store credit balances"
          title="Store Credits"
        >
          <Button color="primary" startContent={<Plus className="w-4 h-4" />} onPress={handleCreate}>
            Issue Credit
          </Button>
        </PageHeader>

        <div className="flex justify-between gap-3 items-end mb-4">
          <Input
            isClearable
            classNames={{ base: "w-full sm:max-w-[44%]" }}
            placeholder="Search credits..."
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

        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>{isEditing ? "Edit Credit" : "Issue Credit"}</ModalHeader>
                <ModalBody>
                  <StoreCreditForm
                    initialData={selectedItem}
                    isEditing={isEditing}
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
          message="Are you sure you want to delete this store credit record?"
          title="Delete Store Credit"
          onConfirm={(id) => handleDelete(id as number)}
          onConfirmProp={deleteConfirmId || ""}
          onOpenChange={setDeleteConfirmOpen}
        />
      </div>
    </PermissionGuard>
  );
}
