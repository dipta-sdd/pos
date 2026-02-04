"use client";

import { useEffect, useState, useCallback } from "react";
import { type Selection } from "@heroui/react";
import { Edit, Trash2, ChevronDown, Calendar, Plus } from "lucide-react";
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
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@heroui/react";
import { useRouter } from "next/navigation";

import UserForm from "./_components/UserForm";

import { SearchIcon } from "@/components/icons";
import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
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
  branches?: any[];
  branch_ids?: number[];
  role_id?: number;
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
  const {
    vendor,
    isLoading: contextLoading,
    membership,
    selectedBranchIds,
    updateBranchFilter,
  } = useVendor();

  // table states
  const [users, setUsers] = useState<VendorUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "joined_at",
    direction: "descending",
  });
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );

  // modal states
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState<VendorUser | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // search states
  const [searchValue, setSearchValue] = useState<string>("");

  // Filter states
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [roles, setRoles] = useState<any[]>([]);

  // Selection states
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));

  // delete confirm states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [deleteBulkConfirmOpen, setDeleteBulkConfirmOpen] =
    useState<boolean>(false);
  const [deleteConfirmProp, setDeleteConfirmProp] = useState<number | string>(
    "",
  );

  const [initialLoad, setInitialLoad] = useState<boolean>(true);

  useEffect(() => {
    if (vendor?.id) {
      fetchUsers(1);
      fetchRoles();
    }
  }, [vendor?.id]);

  useEffect(() => {
    if (vendor?.id && !initialLoad) {
      fetchUsers(1);
    }
  }, [perPage, sortDescriptor, roleFilter, selectedBranchIds]);

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

  const fetchRoles = async () => {
    try {
      const response: any = await api.get(`/roles?vendor_id=${vendor?.id}`);
      setRoles(response?.data?.data || []);
    } catch (_error: any) {}
  };

  const fetchUsers = async (page: number) => {
    setLoading(true);
    setUsers([]);
    try {
      const sortBy = sortDescriptor.column as string;
      const sortDirection =
        sortDescriptor.direction === "ascending" ? "asc" : "desc";

      const response: any = await api.get(`/users`, {
        params: {
          page,
          per_page: perPage,
          vendor_id: vendor?.id,
          search: searchValue,
          sort_by: sortBy,
          sort_direction: sortDirection,
          role_id: roleFilter !== "all" ? roleFilter : undefined,
          branch_ids:
            selectedBranchIds.length > 0 ? selectedBranchIds : undefined,
        },
      });

      setUsers(response?.data?.data || []);
      setCurrentPage(response?.data?.current_page || 1);
      setLastPage(response?.data?.last_page || 1);
    } catch (_error: any) {
      // console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setIsEditing(false);
    onOpen();
  };

  const handleEdit = (user: VendorUser) => {
    // Mapping for UserForm:
    const mappedUser = {
      ...user,
      role_id: user.role?.id, // Extract role ID
      branch_ids: user.branches?.map((b: any) => b.id) || [], // Extract branch IDs
    };

    setSelectedUser(mappedUser as VendorUser);
    setIsEditing(true);
    onOpen();
  };

  const handleFormSuccess = () => {
    onClose();
    fetchUsers(currentPage);
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

  const handleBulkDelete = async () => {
    try {
      const userIds =
        selectedKeys === "all"
          ? users.map((u) => u.id)
          : Array.from(selectedKeys as Set<string>).map((id) => Number(id));

      await (api as any).delete(`/users/bulk`, {
        data: {
          vendor_id: vendor?.id,
          user_ids: userIds,
        },
      });

      toast.success(`${userIds.length} users removed successfully`);
      setSelectedKeys(new Set([]));
      fetchUsers(currentPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove users");
    }
    setDeleteBulkConfirmOpen(false);
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
                onPress={() => handleEdit(user)}
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
    [vendor?.id, router],
  );

  if (contextLoading) return <div>Loading...</div>;

  return (
    <PermissionGuard permission="can_manage_staff">
      <div className="p-6">
        <PageHeader
          description="Manage staff members and their roles"
          title="User Management"
        >
          <Button
            color="primary"
            radius="sm"
            startContent={<Plus className="w-4 h-4" />}
            onPress={handleCreate}
          >
            Add New User
          </Button>
        </PageHeader>
        <div className="flex justify-between gap-3 items-end mb-4">
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
            {selectedKeys !== "all" && (selectedKeys as any).size > 0 ? (
              <Button
                color="danger"
                radius="sm"
                startContent={<Trash2 className="w-4 h-4" />}
                variant="flat"
                onPress={() => setDeleteBulkConfirmOpen(true)}
              >
                Delete Selected ({(selectedKeys as any).size})
              </Button>
            ) : selectedKeys === "all" ? (
              <Button
                color="danger"
                radius="sm"
                startContent={<Trash2 className="w-4 h-4" />}
                variant="flat"
                onPress={() => setDeleteBulkConfirmOpen(true)}
              >
                Delete All ({users.length})
              </Button>
            ) : null}

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
                  Role:{" "}
                  {roleFilter === "all"
                    ? "All"
                    : roles.find((r) => String(r.id) === roleFilter)?.name}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Filter by Role"
                disallowEmptySelection
                selectedKeys={new Set([roleFilter])}
                selectionMode="single"
                onSelectionChange={(keys) => {
                  const selectedValue = Array.from(keys as Set<string>)[0];
                  setRoleFilter(selectedValue);
                }}
              >
                {[
                  <DropdownItem key="all">All Roles</DropdownItem>,
                  ...roles.map((role) => (
                    <DropdownItem key={String(role.id)}>
                      {role.name}
                    </DropdownItem>
                  )),
                ]}
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
          ariaLabel="Users Table"
          columns={columns}
          currentPage={currentPage}
          isLoading={loading}
          items={users}
          lastPage={lastPage}
          perPage={perPage}
          renderCell={renderCell}
          selectedKeys={selectedKeys}
          selectionMode="multiple"
          setCurrentPage={setCurrentPage}
          setPerPage={setPerPage}
          setSortDescriptor={setSortDescriptor}
          sortDescriptor={sortDescriptor}
          visibleColumns={visibleColumns}
          onSelectionChange={setSelectedKeys}
        />
        <Confirm
          isOpen={deleteConfirmOpen}
          message="Are you sure you want to remove this user from the vendor?"
          title="Remove User"
          onConfirm={(id) => handleDelete(id as number)}
          onConfirmProp={deleteConfirmProp}
          onOpenChange={setDeleteConfirmOpen}
        />
        <Confirm
          isOpen={deleteBulkConfirmOpen}
          message={`Are you sure you want to remove ${
            selectedKeys === "all" ? users.length : (selectedKeys as any).size
          } users from the vendor?`}
          title="Bulk Remove Users"
          onConfirm={handleBulkDelete}
          onOpenChange={setDeleteBulkConfirmOpen}
        />

        {/* Create/Edit User Modal */}
        <Modal
          isOpen={isOpen}
          placement="center"
          size="2xl"
          onOpenChange={onOpenChange}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {isEditing ? "Edit User" : "Add New User"}
                </ModalHeader>
                <ModalBody>
                  <UserForm
                    initialData={selectedUser}
                    isEditing={isEditing}
                    onCancel={onClose}
                    onSuccess={handleFormSuccess}
                  />
                </ModalBody>
                {/* Footer is handled inside UserForm (buttons) or we can use ModalFooter if we move buttons out, but UserForm has buttons. */}
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </PermissionGuard>
  );
}
