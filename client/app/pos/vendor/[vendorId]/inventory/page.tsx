"use client";

import { useState, useCallback, useEffect } from "react";
import { Input } from "@heroui/input";
import { SortDescriptor } from "@heroui/table";
import { ChevronDown, Edit, Plus } from "lucide-react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { Selection } from "@heroui/react";
import { Switch } from "@heroui/switch";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

import AddStockModal from "./_components/AddStockModal";
import ViewStockModal from "./_components/ViewStockModal";
import NewInventoryModal from "./_components/NewInventoryModal";

import BarcodeDisplay from "@/components/ui/BarcodeDisplay";

import { SearchIcon } from "@/components/icons";
import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import CustomTable, { Column, ProductImage } from "@/components/ui/CustomTable";
import api from "@/lib/api";
import { UserLoding } from "@/components/user-loding";

interface BranchProductItem {
  id: number;
  variant_name: string;
  variant_value: string;
  sku: string | null;
  barcode: string | null;
  product_id: number;
  product_name: string;
  image_url: string | null;
  total_quantity: number;
  unit_name: string | null;
  unit_abbreviation: string | null;
  is_decimal_allowed: number | boolean;
  branch_product_id?: number | null;
  is_active?: number | null;
}

const columns: Column[] = [
  { name: "IMAGE", uid: "image", sortable: false },
  { name: "PRODUCT", uid: "product_name", sortable: true },
  { name: "VARIANT", uid: "variant_value", sortable: false },
  { name: "SKU", uid: "sku", sortable: true },
  { name: "BARCODE", uid: "barcode", sortable: false },
  { name: "STOCK LEVEL", uid: "stock_quantity", sortable: true },
  { name: "STATUS", uid: "status", sortable: false },
  { name: "ACTIONS", uid: "actions", sortable: false },
];

const INITIAL_VISIBLE_COLUMNS = [
  "image",
  "product_name",
  "variant_value",
  "sku",
  "barcode",
  "stock_quantity",
  "status",
  "actions",
];

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

export default function InventoryPage() {
  const {
    vendor,
    isLoading: contextLoading,
    membership,
    selectedBranchIds,
    updateBranchFilter,
  } = useVendor();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<BranchProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [searchValue, setSearchValue] = useState<string>("");
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "stock_quantity",
    direction: "descending",
  });
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );

  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [isViewStockModalOpen, setIsViewStockModalOpen] = useState(false);
  const [isNewInventoryModalOpen, setIsNewInventoryModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BranchProductItem | null>(
    null,
  );

  const isSingleBranchSelected = selectedBranchIds.length === 1;

  const fetchItems = async (page: number) => {
    if (!vendor?.id) return;
    setLoading(true);
    try {
      const response: any = await api.get(`/branch-products`, {
        params: {
          page,
          per_page: perPage,
          vendor_id: vendor.id,
          search: searchValue,
          sort_by:
            sortDescriptor.column === "product_name"
              ? "product"
              : sortDescriptor.column,
          sort_direction:
            sortDescriptor.direction === "ascending" ? "asc" : "desc",
          branch_ids:
            selectedBranchIds.length > 0 ? selectedBranchIds : undefined,
        },
      });

      setItems(response?.data?.data || []);
      setCurrentPage(response?.data?.current_page || 1);
      setLastPage(response?.data?.last_page || 1);
    } catch {
      console.error("Failed to fetch inventory items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendor?.id) {
      fetchItems(currentPage);
    }
  }, [
    vendor?.id,
    currentPage,
    perPage,
    sortDescriptor,
    searchValue,
    selectedBranchIds,
  ]);

  useEffect(() => {
    const newProductId = searchParams.get("new_product_id");

    if (newProductId && vendor?.id) {
      // Clear the query param to prevent re-triggering
      const url = new URL(window.location.href);

      url.searchParams.delete("new_product_id");
      router.replace(url.pathname + url.search);

      // Fetch the product's variants to open the modal
      const fetchNewProduct = async () => {
        try {
          const response: any = await api.get(`/branch-products`, {
            params: {
              vendor_id: vendor.id,
              product_id: newProductId,
            },
          });

          if (response.data.data.length > 0) {
            openAddStock(response.data.data[0]);
          }
        } catch {
          // Handle error silently
        }
      };

      fetchNewProduct();
    }
  }, [searchParams, vendor?.id]);

  const toggleStatus = async (item: BranchProductItem, newStatus: boolean) => {
    if (!isSingleBranchSelected) {
      toast.error("Please select a single branch to manage product status");

      return;
    }
    try {
      await api.post(`/branch-products/toggle-status`, {
        branch_id: selectedBranchIds[0],
        product_id: item.product_id,
        variant_id: item.id,
        is_active: newStatus,
      });
      fetchItems(currentPage);
      toast.success(
        `Product ${newStatus ? "activated" : "deactivated"} for this branch`,
      );
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  const openAddStock = (item: BranchProductItem) => {
    setSelectedItem(item);
    setIsAddStockModalOpen(true);
  };

  const openViewStock = (item: BranchProductItem) => {
    setSelectedItem(item);
    setIsViewStockModalOpen(true);
  };

  const renderCell = useCallback(
    (item: BranchProductItem, columnKey: React.Key) => {
      switch (columnKey) {
        case "image":
          return (
            <ProductImage alt={item.product_name} image_url={item.image_url} />
          );
        case "product_name":
          return item.product_name || "N/A";
        case "variant_value":
          return item.variant_value || "Default";
        case "sku":
          return item.sku || "N/A";
        case "barcode":
          if (item.barcode) {
            return (
              <div className="max-w-[150px]">
                <BarcodeDisplay
                  fontSize={10}
                  height={30}
                  value={item.barcode}
                  width={1}
                />
              </div>
            );
          }
          return <span className="text-default-400 text-sm">No barcode</span>;
        case "stock_quantity":
          const qty = Number(item.total_quantity);
          const formattedQty = item.is_decimal_allowed ? qty.toFixed(2) : Math.round(qty).toString();
          return (
            <div className="flex flex-col">
              <span className="font-medium">{formattedQty}</span>
              {item.unit_abbreviation && (
                <span className="text-tiny text-default-400">{item.unit_abbreviation}</span>
              )}
            </div>
          );
        case "status":
          if (!isSingleBranchSelected) {
            return (
              <span className="text-default-400 text-sm italic">
                Limited to 1 branch
              </span>
            );
          }

          return (
            <Switch
              color="success"
              isSelected={!!item.is_active}
              size="sm"
              onValueChange={(checked) => toggleStatus(item, checked)}
            />
          );
        case "actions":
          return (
            <div className="flex items-center justify-end gap-2">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => openViewStock(item)}
              >
                <Edit className="w-4 h-4 text-default-400" />
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => openAddStock(item)}
              >
                <Plus className="w-4 h-4 text-danger" />
              </Button>
            </div>
          );
        default:
          return (item as any)[columnKey as keyof BranchProductItem];
      }
    },
    [isSingleBranchSelected, selectedBranchIds, toggleStatus],
  );

  if (contextLoading) return <UserLoding />;

  return (
    <PermissionGuard permission="can_view_inventory_levels">
      <div className="p-6">
        <PageHeader
          description="Manage products and stock levels across branches"
          title="Branch Inventory"
        >
          <Button
            color="primary"
            startContent={<Plus size={20} />}
            onPress={() => setIsNewInventoryModalOpen(true)}
          >
            Add Inventory
          </Button>
        </PageHeader>

        <div className="flex justify-between gap-3 items-end mb-4">
          <Input
            isClearable
            classNames={{ base: "w-full sm:max-w-[44%]" }}
            placeholder="Search products or SKU..."
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

        {!isSingleBranchSelected && (
          <div className="mb-4 bg-default-100 p-3 rounded-lg text-sm text-default-600">
            <strong>Note:</strong> Select a single branch to activate/deactivate
            products and add specific branch stock batches.
          </div>
        )}

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

        {selectedItem && (
          <>
            <AddStockModal
              isOpen={isAddStockModalOpen}
              item={selectedItem}
              onOpenChange={() => setIsAddStockModalOpen(!isAddStockModalOpen)}
              onSuccess={() => fetchItems(currentPage)}
            />
            <ViewStockModal
              isOpen={isViewStockModalOpen}
              isDecimalAllowed={selectedItem.is_decimal_allowed}
              selectedBranchIds={selectedBranchIds}
              variantId={selectedItem.id}
              onOpenChange={() =>
                setIsViewStockModalOpen(!isViewStockModalOpen)
              }
              onSuccess={() => fetchItems(currentPage)}
            />
          </>
        )}

        <NewInventoryModal
          isOpen={isNewInventoryModalOpen}
          onOpenChange={() =>
            setIsNewInventoryModalOpen(!isNewInventoryModalOpen)
          }
          onSelect={(item) => openAddStock(item)}
        />
      </div>
    </PermissionGuard>
  );
}
