"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Edit, Trash2, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

import BranchForm from "./_components/BranchForm";

import { SearchIcon } from "@/components/icons";
import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  type SortDescriptor,
} from "@heroui/table";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Pagination } from "@heroui/pagination";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal";
import { Select, SelectItem } from "@heroui/select";

interface Branch {
  id: number;
  name: string;
  description?: string;
  phone?: string;
  address?: string;
  created_at: string;
}

const columns = [
  { name: "BRANCH NAME", uid: "name", sortable: true },
  { name: "DESCRIPTION", uid: "description" },
  { name: "PHONE", uid: "phone", sortable: true },
  { name: "ADDRESS", uid: "address", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

export default function BranchesPage() {
  const { vendor, currentRole, isLoading: contextLoading } = useVendor();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [searchValue, setSearchValue] = useState("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "created_at",
    direction: "descending",
  });

  useEffect(() => {
    if (vendor?.id) {
      fetchBranches(1);
    }
  }, [vendor?.id, perPage, sortDescriptor]);

  useEffect(() => {
    if (vendor?.id) {
      const delayDebounceFn = setTimeout(() => {
        fetchBranches(1);
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchValue]);

  const fetchBranches = async (page: number) => {
    setLoading(true);
    try {
      const sortBy = sortDescriptor.column as string;
      const sortDirection =
        sortDescriptor.direction === "ascending" ? "asc" : "desc";

      const response = await api.get(
        `/branches?page=${page}&per_page=${perPage}&vendor_id=${vendor?.id}&search=${searchValue}&sort_by=${sortBy}&sort_direction=${sortDirection}`
      );

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
    }
  };

  const handleDelete = async (branchId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this branch? This action cannot be undone."
      )
    )
      return;

    try {
      await api.delete(`/branches/${branchId}`);
      toast.success("Branch deleted successfully");
      fetchBranches(currentPage);
    } catch (error: any) {
      // console.error("Failed to delete branch:", error);
      toast.error(error.response?.data?.message || "Failed to delete branch");
    }
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

  const onRowsPerPageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setPerPage(Number(e.target.value));
      setCurrentPage(1);
    },
    []
  );

  const renderCell = useCallback((branch: Branch, columnKey: React.Key) => {
    const cellValue = branch[columnKey as keyof Branch];

    switch (columnKey) {
      case "name":
        return <span className="font-medium text-small">{branch.name}</span>;
      case "description":
        return (
          <span className="text-small text-default-500">
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
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <button
              className="text-lg text-default-400 cursor-pointer active:opacity-50"
              title="Edit"
              onClick={() => handleEdit(branch)}
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              className="text-lg text-danger cursor-pointer active:opacity-50"
              title="Delete"
              onClick={() => handleDelete(branch.id)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search branches..."
            startContent={<SearchIcon />}
            value={searchValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />
          <Button color="primary" onPress={handleCreate}>
            Add New Branch
          </Button>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {branches.length} branches
          </span>
          <div className="flex items-center gap-2">
            <span className="text-default-400 text-small">Rows per page:</span>
            <Select
              size="sm"
              className="w-20"
              selectedKeys={[String(perPage)]}
              onChange={(e) => onRowsPerPageChange(e as any)}
            >
              <SelectItem key="10" value="10">
                10
              </SelectItem>
              <SelectItem key="15" value="15">
                15
              </SelectItem>
              <SelectItem key="20" value="20">
                20
              </SelectItem>
              <SelectItem key="50" value="50">
                50
              </SelectItem>
            </Select>
          </div>
        </div>
      </div>
    );
  }, [
    searchValue,
    onSearchChange,
    branches.length,
    perPage,
    onRowsPerPageChange,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-center items-center">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          className="overflow-hidden"
          page={currentPage}
          total={lastPage}
          onChange={(page) => fetchBranches(page)}
        />
      </div>
    );
  }, [currentPage, lastPage]);

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

        <Table
          isHeaderSticky
          isStriped
          aria-label="Branches table with sorting"
          classNames={{
            wrapper: "min-h-[222px]",
          }}
          sortDescriptor={sortDescriptor}
          topContent={topContent}
          bottomContent={bottomContent}
          topContentPlacement="inside"
          bottomContentPlacement="inside"
          onSortChange={setSortDescriptor}
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "actions" ? "center" : "start"}
                allowsSorting={column.sortable}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            emptyContent={loading ? "Loading..." : "No branches found."}
            items={branches}
          >
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>

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
      </div>
    </PermissionGuard>
  );
}
