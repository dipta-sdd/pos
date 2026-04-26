"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { History, Search, Filter, Eye, User, Calendar, MapPin, ChevronDown } from "lucide-react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { type Selection } from "@heroui/react";
import { type SortDescriptor } from "@heroui/table";

import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import CustomTable, { Column } from "@/components/ui/CustomTable";
import api from "@/lib/api";
import { formatDateTime } from "@/lib/helper/dates";
import { UserLoding } from "@/components/user-loding";
import { SearchIcon } from "@/components/icons";

const columns: Column[] = [
  { name: "ACTION", uid: "action", sortable: true },
  { name: "USER", uid: "user", sortable: false },
  { name: "MODEL", uid: "model_type", sortable: true },
  { name: "DESCRIPTION", uid: "description", sortable: false },
  { name: "BRANCH", uid: "branch", sortable: false },
  { name: "IP ADDRESS", uid: "ip_address", sortable: true },
  { name: "DATE", uid: "created_at", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = ["action", "user", "model_type", "description", "branch", "created_at", "actions"];

const ACTIONS = [
  { name: "All Actions", uid: "all" },
  { name: "Created", uid: "created" },
  { name: "Updated", uid: "updated" },
  { name: "Deleted", uid: "deleted" },
];

export default function ActivityLogPage() {
  const { vendor, isLoading: contextLoading, membership, selectedBranchIds, updateBranchFilter } = useVendor();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [searchValue, setSearchValue] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  
  const [visibleColumns, setVisibleColumns] = useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "created_at",
    direction: "descending",
  });

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const fetchLogs = useCallback(async (page: number) => {
    if (!vendor?.id) return;
    setLoading(true);
    try {
      const response: any = await api.get('/activity-logs', {
        params: {
          vendor_id: vendor.id,
          page,
          per_page: perPage,
          search: searchValue,
          action: actionFilter !== "all" ? actionFilter : undefined,
          sort_by: sortDescriptor.column,
          sort_direction: sortDescriptor.direction === "ascending" ? "asc" : "desc",
          branch_ids: selectedBranchIds.length > 0 ? selectedBranchIds : undefined,
        }
      });
      setItems(response.data.data || []);
      setCurrentPage(response.data.current_page);
      setLastPage(response.data.last_page);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [vendor?.id, perPage, searchValue, actionFilter, sortDescriptor, selectedBranchIds]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLogs(currentPage);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, fetchLogs]);

  const renderCell = useCallback((item: any, columnKey: React.Key) => {
    switch (columnKey) {
      case "action":
        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            item.action === 'created' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
            item.action === 'updated' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
            item.action === 'deleted' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-800'
          }`}>
            {item.action}
          </span>
        );
      case "user":
        return (
          <div className="flex flex-col">
            <span className="text-sm font-bold">{item.user?.firstName} {item.user?.lastName}</span>
            <span className="text-[10px] text-gray-500">{item.user?.email}</span>
          </div>
        );
      case "model_type":
        return <span className="text-xs font-mono">{item.model_type?.split('\\').pop()}</span>;
      case "branch":
        return item.branch?.name || <span className="text-gray-400 text-[10px] italic">Global / System</span>;
      case "ip_address":
        return <span className="text-xs font-mono text-gray-500">{item.ip_address}</span>;
      case "created_at":
        return formatDateTime(item.created_at);
      case "actions":
        return (
          <Button isIconOnly size="sm" variant="light" onPress={() => {
            setSelectedLog(item);
            onOpen();
          }}>
            <Eye size={16} className="text-default-400" />
          </Button>
        );
      default:
        return item[columnKey as keyof any];
    }
  }, [onOpen]);

  if (contextLoading) return <UserLoding />;

  return (
    <PermissionGuard permission="can_view_user_activity_log">
      <div className="p-6">
        <PageHeader 
          title="Activity Audit Log" 
          description="Track all changes and actions within your organization"
        />

        <div className="flex justify-between gap-3 items-end mb-4">
          <Input
            isClearable
            classNames={{
              base: "w-full sm:max-w-[44%]",
            }}
            placeholder="Search logs..."
            radius="sm"
            startContent={<SearchIcon className="text-default-500" />}
            value={searchValue}
            variant="bordered"
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
                  Action: {ACTIONS.find(a => a.uid === actionFilter)?.name}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Filter by Action"
                selectedKeys={new Set([actionFilter])}
                selectionMode="single"
                onSelectionChange={(keys) => {
                  const selectedValue = Array.from(keys as Set<string>)[0];
                  setActionFilter(selectedValue);
                }}
              >
                {ACTIONS.map((action) => (
                  <DropdownItem key={action.uid}>
                    {action.name}
                  </DropdownItem>
                ))}
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
                    {column.name.toLowerCase()}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <CustomTable
          columns={columns}
          items={items}
          isLoading={loading}
          currentPage={currentPage}
          lastPage={lastPage}
          perPage={perPage}
          sortDescriptor={sortDescriptor}
          visibleColumns={visibleColumns}
          setCurrentPage={setCurrentPage}
          setPerPage={setPerPage}
          setSortDescriptor={setSortDescriptor}
          renderCell={renderCell}
        />

        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl" scrollBehavior="inside">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Activity Detail
                </ModalHeader>
                <ModalBody className="pb-8">
                  {selectedLog && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                          <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">User</p>
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-primary" />
                            <span className="text-sm font-bold">{selectedLog.user?.firstName}</span>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                          <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Date</p>
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-primary" />
                            <span className="text-sm font-bold">{formatDateTime(selectedLog.created_at)}</span>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                          <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Action</p>
                          <span className="text-sm font-bold capitalize">{selectedLog.action}</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                          <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Branch</p>
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-primary" />
                            <span className="text-sm font-bold">{selectedLog.branch?.name || "Global"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-bold text-sm">Data Changes</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-bold text-gray-500 mb-2">Previous State</p>
                            <pre className="p-4 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 rounded-lg text-xs overflow-auto max-h-[300px]">
                              {JSON.stringify(selectedLog.old_values, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-500 mb-2">New State</p>
                            <pre className="p-4 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 rounded-lg text-xs overflow-auto max-h-[300px]">
                              {JSON.stringify(selectedLog.new_values, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-[10px] font-mono text-gray-500">
                        IP: {selectedLog.ip_address} | UA: {selectedLog.user_agent}
                      </div>
                    </div>
                  )}
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </PermissionGuard>
  );
}
