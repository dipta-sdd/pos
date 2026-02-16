"use client";

import { useEffect, useState, useCallback } from "react";
import { type Selection } from "@heroui/react";
import { Edit, Trash2, ChevronDown, User, Calendar, Eye } from "lucide-react";
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
import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import CustomTable, {
  Column,
  LOGGER_COLUMNS,
  loggerColumns,
} from "@/components/ui/CustomTable";
import Confirm from "@/components/ui/Confirm";
import { formatDateTime } from "@/lib/helper/dates";
import { Role } from "@/lib/types/auth";
import api from "@/lib/api";
import { UserLoding } from "@/components/user-loding";

const columns: Column[] = [
  { name: "NAME", uid: "name", sortable: true },
  ...LOGGER_COLUMNS,
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "name",
  "created_at",
  "created_by",
  "updated_at",
  "updated_by",
  "actions",
];

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

export default function RolesPage() {
  const router = useRouter();
  const { vendor, isLoading: contextLoading, membership } = useVendor();
  // table states
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "created_at",
    direction: "descending",
  });
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );

  // end table states
  // modal states
  const [searchValue, setSearchValue] = useState<string>("");
  // end modal states
  // delete confirm states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [deleteConfirmProp, setDeleteConfirmProp] = useState<number | string>(
    "",
  );

  // end delete confirm states
  const [initialLoad, setInitialLoad] = useState<boolean>(true);

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

      const response: any = await api.get(`/roles`, {
        params: {
          page,
          per_page: perPage,
          vendor_id: vendor?.id,
          search: searchValue,
          sort_by: sortBy,
          sort_direction: sortDirection,
        },
      });

      setRoles(response?.data?.data || []);
      setCurrentPage(response?.data?.current_page || 1);
      setLastPage(response?.data?.last_page || 1);
    } catch (_error: any) {
      // console.error("Failed to fetch roles:", error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
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

  const renderCell = useCallback(
    (role: Role, columnKey: React.Key) => {
      const cellValue = role[columnKey as keyof Role];

      switch (columnKey) {
        case "name":
          return <span className="">{role.name}</span>;

        case "created_at":
        case "updated_at":
        case "created_by":
        case "updated_by":
          return loggerColumns(columnKey, role);
        case "actions":
          return (
            <div className="flex items-center justify-end gap-2">
              {vendor?.id && (
                <Button
                  className="min-w-none"
                  color="primary"
                  size="sm"
                  title={
                    membership?.role?.can_manage_roles_and_permissions
                      ? "Edit"
                      : "View"
                  }
                  variant="light"
                  onPress={() =>
                    router.push(`/pos/vendor/${vendor?.id}/roles/${role.id}`)
                  }
                >
                  {membership?.role?.can_manage_roles_and_permissions ? (
                    <Edit className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              )}

              {membership?.role?.can_manage_roles_and_permissions && (
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
              )}
            </div>
          );
        default:
          return cellValue;
      }
    },
    [vendor?.id, router, membership],
  );

  if (contextLoading) return <UserLoding />;

  return (
    <PermissionGuard permission="can_view_roles">
      <div className="p-6">
        <PageHeader
          description="Manage your staff roles and permissions"
          title="Roles"
        >
          {membership?.role?.can_manage_roles_and_permissions && (
            <Button
              color="primary"
              radius="sm"
              onPress={() => router.push(`/pos/vendor/${vendor?.id}/roles/new`)}
            >
              Add New Role
            </Button>
          )}
        </PageHeader>
        <div className="flex justify-between gap-3 items-end mb-4">
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
