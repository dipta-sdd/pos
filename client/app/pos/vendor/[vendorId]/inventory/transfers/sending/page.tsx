"use client";

import { useState, useCallback, useEffect } from "react";
import { SortDescriptor } from "@heroui/table";
import { Tabs, Tab, Chip } from "@heroui/react";
import { Plus, Edit, Eye } from "lucide-react";
import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Selection } from "@heroui/table";

import BulkActionBar, { BulkAction } from "../../_components/BulkActionBar";

import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import CustomTable, { Column } from "@/components/ui/CustomTable";
import api from "@/lib/api";
import { StockTransfer } from "@/lib/types/general";
import { formatDateTime } from "@/lib/helper/dates";
import Confirm from "@/components/ui/Confirm";
import { UserLoding } from "@/components/user-loding";

const columns: Column[] = [
  { name: "TRANSFER ID", uid: "id", sortable: true },
  { name: "DESTINATION", uid: "to_branch", sortable: false },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "CREATED AT", uid: "created_at", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

export default function OutgoingTransfersPage() {
  const router = useRouter();
  const { vendor, isLoading: contextLoading, selectedBranchIds } = useVendor();
  const [items, setItems] = useState<StockTransfer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "created_at",
    direction: "descending",
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [isBulkActionLoading, setIsBulkActionLoading] =
    useState<boolean>(false);

  const getSelectedItems = () => {
    if (selectedKeys === "all") return items;

    return items.filter(
      (item) =>
        Array.from(selectedKeys).includes(item.id.toString()) ||
        Array.from(selectedKeys).includes(item.id),
    );
  };

  const getBulkActions = (): BulkAction[] => {
    const selectedItems = getSelectedItems();

    if (selectedItems.length === 0) return [];

    const allRequested = selectedItems.every((i) => i.status === "requested");
    const allAccepted = selectedItems.every((i) => i.status === "accepted");

    const actions: BulkAction[] = [];

    if (allRequested) {
      actions.push({
        label: "Approve All",
        action: "accepted",
        color: "primary",
      });
    }

    if (allAccepted) {
      actions.push({
        label: "Ship All",
        action: "in_transit",
        color: "secondary",
      });
      actions.push({
        label: "Cancel All",
        action: "cancelled",
        color: "danger",
      });
    }

    return actions;
  };

  const handleBulkAction = async (action: string) => {
    const selectedItems = getSelectedItems();

    if (selectedItems.length === 0) return;

    setIsBulkActionLoading(true);
    try {
      await Promise.all(
        selectedItems.map((item) =>
          api.post(`/stock-transfers/${item.id}/status`, { status: action }),
        ),
      );
      toast.success("Bulk action completed successfully");
      setSelectedKeys(new Set([]));
      fetchItems(currentPage);
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete bulk action");
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const fetchItems = async (page: number) => {
    if (!vendor?.id) return;
    setLoading(true);
    try {
      const params: any = {
        page,
        per_page: perPage,
        vendor_id: vendor.id,
      };

      if (selectedBranchIds.length > 0) {
        params.branch_id = selectedBranchIds[0];
      }
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response: any = await api.get(`/stock-transfers/sending`, {
        params,
      });

      setItems(response?.data?.data || []);
      setCurrentPage(response?.data?.current_page || 1);
      setLastPage(response?.data?.last_page || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(currentPage);
    setSelectedKeys(new Set([]));
  }, [vendor?.id, currentPage, perPage, selectedBranchIds, statusFilter]);

  const renderCell = useCallback(
    (item: StockTransfer, columnKey: React.Key) => {
      switch (columnKey) {
        case "to_branch":
          return item.to_branch?.name || "N/A";
        case "status":
          const statusColors: any = {
            requested: "primary",
            accepted: "warning",
            in_transit: "secondary",
            shipped: "warning",
            completed: "success",
            cancelled: "danger",
            rejected: "danger",
          };

          return (
            <Chip
              className="capitalize"
              color={statusColors[item.status] || "default"}
              size="sm"
              variant="flat"
            >
              {item.status}
            </Chip>
          );
        case "created_at":
          return formatDateTime(item.created_at);
        case "actions":
          const canEdit = ["accepted", "requested"].includes(item.status);

          return (
            <div className="flex items-center justify-end gap-2">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() =>
                  router.push(
                    `/pos/vendor/${vendor?.id}/inventory/transfers/sending/${item.id}`,
                  )
                }
              >
                {canEdit ? (
                  <Edit className="w-4 h-4 text-primary" />
                ) : (
                  <Eye className="w-4 h-4 text-default-400" />
                )}
              </Button>
            </div>
          );
        default:
          return (item as any)[columnKey as string];
      }
    },
    [vendor?.id, router],
  );

  if (contextLoading) return <UserLoding />;

  return (
    <PermissionGuard permission="can_view_stock_and_inventory">
      <div className="p-6">
        <PageHeader
          description="Items leaving your branches"
          title="Outgoing Transfers"
        >
          <Button
            color="primary"
            isDisabled={selectedBranchIds.length === 0}
            startContent={<Plus className="w-4 h-4" />}
            onPress={() =>
              router.push(
                `/pos/vendor/${vendor?.id}/inventory/transfers/sending/new`,
              )
            }
          >
            New Transfer
          </Button>
        </PageHeader>

        <div className="mt-6 flex flex-col gap-4">
          <Tabs
            color="primary"
            selectedKey={statusFilter}
            variant="underlined"
            onSelectionChange={(key) => setStatusFilter(key as string)}
          >
            <Tab key="all" title="All Transfers" />
            <Tab key="requested" title="Requested" />
            <Tab key="accepted" title="Accepted" />
            <Tab key="in_transit" title="In Transit" />
            <Tab key="shipped" title="Shipped" />
            <Tab key="completed" title="Completed" />
          </Tabs>

          <BulkActionBar
            actions={getBulkActions()}
            isLoading={isBulkActionLoading}
            selectedCount={
              selectedKeys === "all" ? items.length : selectedKeys.size
            }
            onAction={handleBulkAction}
          />

          <CustomTable
            columns={columns}
            currentPage={currentPage}
            isLoading={loading}
            items={items}
            lastPage={lastPage}
            perPage={perPage}
            renderCell={renderCell}
            selectedKeys={selectedKeys}
            selectionMode="multiple"
            setCurrentPage={setCurrentPage}
            setPerPage={setPerPage}
            setSortDescriptor={setSortDescriptor}
            sortDescriptor={sortDescriptor}
            visibleColumns={
              new Set(["id", "to_branch", "status", "created_at", "actions"])
            }
            onSelectionChange={setSelectedKeys}
          />
        </div>

        <Confirm
          isOpen={deleteConfirmOpen}
          message="Delete this transfer?"
          title="Delete"
          onConfirm={() =>
            deleteConfirmId &&
            api
              .delete(`/stock-transfers/${deleteConfirmId}`)
              .then(() => fetchItems(currentPage))
          }
          onOpenChange={setDeleteConfirmOpen}
        />
      </div>
    </PermissionGuard>
  );
}
