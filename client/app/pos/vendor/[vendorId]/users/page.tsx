"use client";

import { useEffect, useState, useCallback } from "react";
import { type Selection } from "@heroui/react";
import { Edit, Trash2, ChevronDown, User, Calendar, Plus } from "lucide-react";
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

interface VendorUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  role?: {
    id: number;
    name: string;
  };
  joined_at: string;
}

const columns: Column[] = [
  { name: "NAME", uid: "name", sortable: true },
  { name: "EMAIL", uid: "email", sortable: true },
  { name: "ROLE", uid: "role", sortable: false }, // Sorting by nested role needs backend support, currently simplified
  { name: "JOINED AT", uid: "joined_at", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "name",
  "email",
  "role",
  "joined_at",
  "actions",
];

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

export default function UsersPage() {
  const router = useRouter();
  const { vendor, isLoading: contextLoading } = useVendor();

  // table states
  const [users, setUsers] = useState<VendorUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "joined_at",
    direction: "descending",
  });
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );

  // modal states
  const [searchValue, setSearchValue] = useState("");

  // delete confirm states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [deleteConfirmProp, setDeleteConfirmProp] = useState<number | string>(
    ""
  );

  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (vendor?.id) {
      fetchUsers(1);
    }
  }, [vendor?.id]);

  useEffect(() => {
    if (vendor?.id && !initialLoad) {
      fetchUsers(1);
    }
  }, [perPage, sortDescriptor]);

  useEffect(() => {
    if (vendor?.id && !initialLoad) {
      fetchUsers(currentPage);
    }
  }, [currentPage]);

  useEffect(() => {
    if (vendor?.id && !initialLoad) {
      const delayDebounceFn = setTimeout(() => {
        fetchUsers(1);
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchValue]);

  const fetchUsers = async (page: number) => {
    setLoading(true);
    setUsers([]);
    try {
      const sortBy = sortDescriptor.column as string;
      const sortDirection =
        sortDescriptor.direction === "ascending" ? "asc" : "desc";

      const response = await api.get(`/users`, {
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
      setUsers(response?.data?.data);
      // @ts-ignore
      setCurrentPage(response?.data?.current_page);
      // @ts-ignore
      setLastPage(response?.data?.last_page);
    } catch (_error) {
      // console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const handleDelete = async (userId: number) => {
    try {
      await api.delete(`/users/${userId}?vendor_id=${vendor?.id}`);
      toast.success("User removed successfully");
      fetchUsers(currentPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove user");
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
    (user: VendorUser, columnKey: React.Key) => {
      switch (columnKey) {
        case "name":
          return (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-small">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-tiny text-default-400">
                  {user.mobile || "No mobile"}
                </span>
              </div>
            </div>
          );
        case "email":
          return <span className="text-small">{user.email}</span>;
        case "role":
          return (
            <span className="text-tiny bg-default-100 px-2 py-0.5 rounded-full inline-block w-fit">
              {user.role?.name || "No Role"}
            </span>
          );
        case "joined_at":
          return (
            <div className="flex items-center gap-2 text-small">
              <Calendar className="w-4 h-4 text-default-400" />
              {formatDateTime(user.joined_at)}
            </div>
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
                  router.push(`/pos/vendor/${vendor?.id}/users/${user.id}`)
                }
              >
                <Edit className="w-4 h-4" />
              </Button>

              <Button
                className="min-w-none"
                color="danger"
                size="sm"
                title="Remove"
                variant="light"
                onPress={() => {
                  setDeleteConfirmOpen(true);
                  setDeleteConfirmProp(user.id);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          );
        default:
          return null;
      }
    },
    [vendor?.id, router]
  );

  if (contextLoading) return <div>Loading...</div>;

  return (
    <PermissionGuard permission="can_manage_staff">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage staff members and their roles
          </p>
        </div>
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            classNames={{
              base: "w-full sm:max-w-[44%]",
            }}
            placeholder="Search users..."
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
              startContent={<Plus className="w-4 h-4" />}
              onPress={() => router.push(`/pos/vendor/${vendor?.id}/users/new`)}
            >
              Add New User
            </Button>
          </div>
        </div>

        <CustomTable
          ariaLabel="Users Table"
          columns={columns}
          currentPage={currentPage}
          isLoading={loading}
          items={users}
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
          title="Remove User"
          message="Are you sure you want to remove this user from the vendor?"
        />
      </div>
    </PermissionGuard>
  );
}
