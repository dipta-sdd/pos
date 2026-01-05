"use client";

import { useEffect, useState, useCallback } from "react";
import { type Selection } from "@heroui/react";
import { Edit, Trash2, ChevronDown, User, Calendar } from "lucide-react";
import { toast } from "sonner";
import { type SortDescriptor } from "@heroui/table";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { useRouter } from "next/navigation";

import { SearchIcon } from "@/components/icons";
import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import CustomTable, { Column } from "@/components/ui/CustomTable";
import Confirm from "@/components/ui/Confirm";
import { formatDateTime } from "@/lib/helper/dates";
import { Role } from "@/lib/types/auth";

const columns: Column[] = [
  { name: "NAME", uid: "name", sortable: true },
  { name: "CREATED AT", uid: "created_at", sortable: true },
  { name: "CREATED BY", uid: "created_by_name", sortable: true },
  { name: "UPDATED AT", uid: "updated_at", sortable: true },
  { name: "UPDATED BY", uid: "updated_by_name", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "name",
  "created_at",
  "created_by_name",
  "updated_at",
  "updated_by_name",
  "actions",
];

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

export default function RolesPage() {
  const router = useRouter();
  const { vendor, isLoading: contextLoading } = useVendor();
  // table states
  const [roles, setRoles] = useState<Role[]>([]);
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
      fetchRoles(1);
    }
  }, [vendor?.id]);
  useEffect(() => {
    if (vendor?.id && !initialLoad) {
      fetchRoles(1);
    }
  }, [perPage, sortDescriptor]);
  useEffect(() => {
    if (vendor?.id && !initialLoad) {
      fetchRoles(currentPage);
    }
  }, [currentPage]);
  useEffect(() => {
    if (vendor?.id && !initialLoad) {
      const delayDebounceFn = setTimeout(() => {
        fetchRoles(1);
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchValue]);

  const fetchRoles = async (page: number) => {
    setLoading(true);
    try {
      const sortBy = sortDescriptor.column as string;
      const sortDirection =
        sortDescriptor.direction === "ascending" ? "asc" : "desc";

      const response = await api.get(`/roles`, {
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
      setRoles(response?.data?.data);
      // @ts-ignore
      setCurrentPage(response?.data?.current_page);
      // @ts-ignore
      setLastPage(response?.data?.last_page);
    } catch (_error) {
      // console.error("Failed to fetch roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roleId: number) => {
    try {
      await api.delete(`/roles/${roleId}?vendor_id=${vendor?.id}`);
      toast.success("Role deleted successfully");
      fetchRoles(currentPage);
    } catch (error: any) {
      // console.error("Failed to delete role:", error);
      toast.error(error.response?.data?.message || "Failed to delete role");
    }
    setDeleteConfirmOpen(false);
    setDeleteConfirmProp("");
  };

  const onSearchChange = useCallback((value?: string) => {
    setSearchValue(value || "");
    setCurrentPage(1);
  }, []);

  const onClear = useCallback(() => {
    setSearchValue("");
    setCurrentPage(1);
  }, []);

  const renderCell = useCallback((role: Role, columnKey: React.Key) => {
    const cellValue = role[columnKey as keyof Role];

    switch (columnKey) {
      case "name":
        return <span className="">{role.name}</span>;
      case "created_at":
        return role.created_at ? (
          <div className="flex items-center gap-2 text-small">
            <Calendar className="w-4 h-4 text-default-400" />
            {formatDateTime(role.created_at)}
          </div>
        ) : (
          <span className="text-default-500">-</span>
        );
      case "updated_at":
        return role.updated_at ? (
          <div className="flex items-center gap-2 text-small">
            <Calendar className="w-4 h-4 text-default-400" />
            {formatDateTime(role.updated_at)}
          </div>
        ) : (
          <span className="text-default-500">-</span>
        );
      case "updated_by_name":
        return role?.updated_by_name ? (
          <div className="flex items-center gap-2 text-small">
            <User className="w-4 h-4 text-default-400" />
            {role.updated_by_name}
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
              onPress={() =>
                router.push(`/pos/vendor/${vendor?.id}/roles/${role.id}`)
              }
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
                setDeleteConfirmProp(role.id);
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
    <PermissionGuard permission="can_manage_roles_and_permissions">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Roles
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
            placeholder="Search roles..."
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
            <Button
              color="primary"
              radius="sm"
              onPress={() => router.push(`/pos/vendor/${vendor?.id}/roles/new`)}
            >
              Add New Role
            </Button>
          </div>
        </div>

        <CustomTable
        ariaLabel="Roles Table"
          columns={columns}
          currentPage={currentPage}
          isLoading={loading}
          items={roles}
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
          onConfirm={(id) => handleDelete(id as number)}
          onConfirmProp={deleteConfirmProp}
          onOpenChange={setDeleteConfirmOpen}
        />
      </div>
    </PermissionGuard>
  );
}
