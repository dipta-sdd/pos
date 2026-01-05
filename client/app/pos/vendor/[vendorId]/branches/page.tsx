"use client";

import { useEffect, useState, useCallback } from "react";
import { type Selection } from "@heroui/react";
import {
  Edit,
  Trash2,
  MapPin,
  Phone,
  ChevronDown,
  User,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { type SortDescriptor } from "@heroui/table";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";

import BranchForm from "./_components/BranchForm";

import PermissionGuard from "@/components/auth/PermissionGuard";
import { useVendor } from "@/lib/contexts/VendorContext";
import { SearchIcon } from "@/components/icons";
import api from "@/lib/api";
import CustomTable, { Column } from "@/components/ui/CustomTable";
import Confirm from "@/components/ui/Confirm";
import { Branch } from "@/lib/types/general";
import { formatDateTime } from "@/lib/helper/dates";

const columns: Column[] = [
  { name: "BRANCH NAME", uid: "name", sortable: true },
  { name: "DESCRIPTION", uid: "description" },
  { name: "PHONE", uid: "phone", sortable: true },
  { name: "ADDRESS", uid: "address", sortable: true },
  { name: "CREATED AT", uid: "created_at", sortable: true },
  { name: "CREATED BY", uid: "created_by_name", sortable: true },
  { name: "UPDATED AT", uid: "updated_at", sortable: true },
  { name: "UPDATED BY", uid: "updated_by_name", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "name",
  "phone",
  "address",
  "updated_at",
  "actions",
];

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

export default function BranchesPage() {
  const { vendor, isLoading: contextLoading } = useVendor();
  // table states
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "created_at",
    direction: "descending",
  });
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );

  // end table states
  // modal states
  const [searchValue, setSearchValue] = useState("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  // end modal states
  // delete confirm states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [deleteConfirmProp, setDeleteConfirmProp] = useState<number | string>(
    "",
  );

  // end delete confirm states
  const [initialLoad, setInitialLoad] = useState(true);
  useEffect(() => {
    if (vendor?.id) {
      fetchBranches(1);
    }
  }, [vendor?.id]);
  useEffect(() => {
    if (vendor?.id && !initialLoad) {
      fetchBranches(1);
    }
  }, [perPage, sortDescriptor]);
  useEffect(() => {
    if (vendor?.id && !initialLoad) {
      fetchBranches(currentPage);
    }
  }, [currentPage]);
  useEffect(() => {
    if (vendor?.id && !initialLoad) {
      const delayDebounceFn = setTimeout(() => {
        fetchBranches(1);
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchValue]);

  const fetchBranches = async (page: number) => {
    setLoading(true);
    setBranches([]);
    try {
      const sortBy = sortDescriptor.column as string;
      const sortDirection =
        sortDescriptor.direction === "ascending" ? "asc" : "desc";

      const response = await api.get(`/branches`, {
        params: {
          page,
          per_page: perPage,
          vendor_id: vendor?.id,
          search: searchValue,
          sort_by: sortBy,
          sort_direction: sortDirection,
        },
      });

      // @ts-ignore
      setBranches(response?.data?.data);
      // @ts-ignore
      setCurrentPage(response?.data?.current_page);
      // @ts-ignore
      setLastPage(response?.data?.last_page);
    } catch (_error) {
      // console.error("Failed to fetch branches:", error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const handleDelete = async (branchId: number) => {
    try {
      await api.delete(`/branches/${branchId}?vendor_id=${vendor?.id}`);
      toast.success("Branch deleted successfully");
      fetchBranches(currentPage);
    } catch (error: any) {
      // console.error("Failed to delete branch:", error);
      toast.error(error.response?.data?.message || "Failed to delete branch");
    }
    setDeleteConfirmOpen(false);
    setDeleteConfirmProp("");
  };

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    onOpen();
  };

  const handleCreate = () => {
    setSelectedBranch(null);
    onOpen();
  };

  const handleModalClose = () => {
    onOpenChange();
    setSelectedBranch(null);
  };

  const handleSuccess = () => {
    handleModalClose();
    fetchBranches(currentPage);
  };

  const onSearchChange = useCallback((value?: string) => {
    setSearchValue(value || "");
    setCurrentPage(1);
  }, []);

  const onClear = useCallback(() => {
    setSearchValue("");
    setCurrentPage(1);
  }, []);

  const renderCell = useCallback((branch: Branch, columnKey: React.Key) => {
    const cellValue = branch[columnKey as keyof Branch];

    switch (columnKey) {
      case "name":
        return <span className="">{branch.name}</span>;
      case "description":
        return (
          <span className="text-small text-default-500 text-truncate">
            {branch.description || "-"}
          </span>
        );
      case "phone":
        return branch.phone ? (
          <div className="flex items-center gap-2 text-small">
            <Phone className="w-4 h-4 text-default-400" />
            {branch.phone}
          </div>
        ) : (
          <span className="text-default-500">-</span>
        );
      case "address":
        return branch.address ? (
          <div className="flex items-center gap-2 text-small">
            <MapPin className="w-4 h-4 text-default-400" />
            {branch.address}
          </div>
        ) : (
          <span className="text-default-500">-</span>
        );
      case "created_at":
        return branch.created_at ? (
          <div className="flex items-center gap-2 text-small">
            <Calendar className="w-4 h-4 text-default-400" />
            {formatDateTime(branch.created_at)}
          </div>
        ) : (
          <span className="text-default-500">-</span>
        );
      case "updated_at":
        return branch.updated_at ? (
          <div className="flex items-center gap-2 text-small">
            <Calendar className="w-4 h-4 text-default-400" />
            {formatDateTime(branch.updated_at)}
          </div>
        ) : (
          <span className="text-default-500">-</span>
        );
      case "updated_by_name":
        return branch.updated_by_name ? (
          <div className="flex items-center gap-2 text-small">
            <User className="w-4 h-4 text-default-400" />
            {branch.updated_by_name}
          </div>
        ) : (
          <span className="text-default-500">-</span>
        );
      case "actions":
        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              className="min-w-none"
              color="primary"
              size="sm"
              title="Edit"
              variant="light"
              onPress={() => handleEdit(branch)}
            >
              <Edit className="w-4 h-4" />
            </Button>

            <Button
              className="min-w-none"
              color="danger"
              size="sm"
              title="Delete"
              variant="light"
              onPress={() => {
                setDeleteConfirmOpen(true);
                setDeleteConfirmProp(branch.id);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  if (contextLoading) return <div>Loading...</div>;

  return (
    <PermissionGuard permission="can_manage_branches_and_counters">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Branches
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your shop locations
          </p>
        </div>
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            classNames={{
              base: "w-full sm:max-w-[44%]",
            }}
            placeholder="Search branches..."
            radius="sm"
            startContent={<SearchIcon className="text-default-500" />}
            value={searchValue}
            variant="bordered"
            onClear={onClear}
            onValueChange={onSearchChange}
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
            <Button color="primary" radius="sm" onPress={handleCreate}>
              Add New Branch
            </Button>
          </div>
        </div>

        <CustomTable
          columns={columns}
          currentPage={currentPage}
          isLoading={loading}
          items={branches}
          lastPage={lastPage}
          perPage={perPage}
          renderCell={renderCell}
          setCurrentPage={setCurrentPage}
          setPerPage={setPerPage}
          setSortDescriptor={setSortDescriptor}
          sortDescriptor={sortDescriptor}
          visibleColumns={visibleColumns}
        />

        <Modal
          className="bg-white dark:bg-gray-800"
          isOpen={isOpen}
          size="2xl"
          onOpenChange={onOpenChange}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {selectedBranch ? "Edit Branch" : "Create New Branch"}
                </ModalHeader>
                <ModalBody className="p-6">
                  <BranchForm
                    initialData={selectedBranch}
                    isEditing={!!selectedBranch}
                    onCancel={onClose}
                    onSuccess={handleSuccess}
                  />
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
        <Confirm
          isOpen={deleteConfirmOpen}
          onConfirm={(id) => handleDelete(id as number)}
          onConfirmProp={deleteConfirmProp}
          onOpenChange={setDeleteConfirmOpen}
        />
      </div>
    </PermissionGuard>
  );
}
