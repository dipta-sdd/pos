"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

import PermissionGuard from "@/components/auth/PermissionGuard";
import { useVendor } from "@/lib/contexts/VendorContext";
import api from "@/lib/api";
import { Role } from "@/lib/types/auth";
import { SearchIcon } from "@/components/icons";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Pagination } from "@heroui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import type { SortDescriptor } from "@heroui/table";
import { Select, SelectItem } from "@heroui/select";

const columns = [
  { name: "ROLE NAME", uid: "name", sortable: true },
  { name: "CREATED AT", uid: "created_at", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

export default function RolesPage() {
  const { vendor, currentRole, isLoading: contextLoading } = useVendor();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [searchValue, setSearchValue] = useState("");
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "created_at",
    direction: "descending",
  });

  useEffect(() => {
    if (vendor?.id) {
      fetchRoles(1);
    }
  }, [vendor?.id, perPage, sortDescriptor]);

  useEffect(() => {
    if (vendor?.id) {
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

      const response = await api.get(
        `/roles?page=${page}&per_page=${perPage}&vendor_id=${vendor?.id}&search=${searchValue}&sort_by=${sortBy}&sort_direction=${sortDirection}`
      );

      // @ts-ignore
      setRoles(response?.data?.data);
      // @ts-ignore
      setCurrentPage(response?.data?.current_page);
      // @ts-ignore
      setLastPage(response?.data?.last_page);
      window.scrollTo(0, 0);
    } catch (_error) {
      // console.error("Failed to fetch roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roleId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this role? This action cannot be undone."
      )
    )
      return;

    try {
      await api.delete(`/roles/${roleId}?vendor_id=${vendor?.id}`);
      toast.success("Role deleted successfully");
      fetchRoles(currentPage);
    } catch (_error) {
      // console.error("Failed to delete role:", error);
      toast.error("Failed to delete role");
    }
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

  const renderCell = useCallback(
    (role: Role, columnKey: React.Key) => {
      const cellValue = role[columnKey as keyof Role];

      switch (columnKey) {
        case "name":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small">{role.name}</p>
              {role.name === "Owner" && (
                <span className="text-tiny bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full dark:bg-amber-900/30 dark:text-amber-300 inline-block w-fit">
                  System
                </span>
              )}
            </div>
          );
        case "created_at":
          return (
            <span className="text-small">
              {new Date(role.created_at).toLocaleDateString()}
            </span>
          );
        case "actions":
          return role.name !== "Owner" ? (
            <div className="relative flex items-center gap-2">
              <Link
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                href={`/pos/vendor/${vendor?.id}/roles/${role.id}`}
                title={
                  currentRole?.can_manage_roles_and_permissions
                    ? "Edit Role"
                    : "View Role"
                }
              >
                {currentRole?.can_manage_roles_and_permissions ? (
                  <Edit className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Link>
              {currentRole?.can_manage_roles_and_permissions && (
                <button
                  className="text-lg text-danger cursor-pointer active:opacity-50"
                  title="Delete Role"
                  onClick={() => handleDelete(role.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : null;
        default:
          return cellValue;
      }
    },
    [currentRole, vendor]
  );

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search roles..."
            startContent={<SearchIcon />}
            value={searchValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />
          {currentRole?.can_manage_roles_and_permissions && (
            <Link href={`/pos/vendor/${vendor?.id}/roles/new`}>
              <Button color="primary">Create New Role</Button>
            </Link>
          )}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {roles.length} roles
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
    currentRole,
    vendor,
    roles.length,
    perPage,
    onRowsPerPageChange,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="flex justify-center items-center">
        <Pagination
          isCompact={false}
          showControls
          className="overflow-hidden"
          color="primary"
          page={currentPage}
          total={lastPage}
          onChange={(page) => fetchRoles(page)}
        />
      </div>
    );
  }, [currentPage, lastPage]);

  if (contextLoading) return <div>Loading...</div>;

  return (
    <PermissionGuard permission="can_view_roles">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Roles & Permissions
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage user roles and access levels
          </p>
        </div>

        <Table
          isHeaderSticky
          aria-label="Roles table with sorting"
          bottomContent={bottomContent}
          bottomContentPlacement="outside"
          classNames={{
            wrapper: "min-h-[222px]",
          }}
          sortDescriptor={sortDescriptor}
          topContent={topContent}
          topContentPlacement="outside"
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
            emptyContent={
              loading
                ? "Loading..."
                : "No roles found. Create one to get started."
            }
            items={roles}
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
      </div>
    </PermissionGuard>
  );
}
