"use client";

import { useState, useCallback, useEffect } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { SortDescriptor } from "@heroui/table";
import { Plus, ChevronDown, Edit, Trash2 } from "lucide-react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Selection } from "@heroui/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

import { SearchIcon } from "@/components/icons";
import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import CustomTable, {
  Column,
  LOGGER_COLUMNS,
  loggerColumns,
  ProductImage,
} from "@/components/ui/CustomTable";
import api from "@/lib/api";
import { Product as BaseProduct } from "@/lib/types/general";
import Confirm from "@/components/ui/Confirm";
import { UserLoding } from "@/components/user-loding";

type Product = BaseProduct & {
  category_name: string;
  created_by_name: string;
  updated_by_name: string;
  unit_of_measure_name: string;
  unit_of_measure_abbreviation: string;
};

const columns: Column[] = [
  { name: "ID", uid: "id", sortable: true },
  { name: "IMAGE", uid: "image" },
  { name: "NAME", uid: "name", sortable: true },
  { name: "DESCRIPTION", uid: "description" },
  { name: "CATEGORY", uid: "category", sortable: true },
  { name: "UNIT", uid: "unit_of_measure", sortable: true },
  ...LOGGER_COLUMNS,
  { name: "ACTIONS", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "image",
  "name",
  "category",
  "unit_of_measure",
  "created_at",
  "created_by",
  "actions",
];

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

export default function ProductsPage() {
  const router = useRouter();

  const { vendor, isLoading: contextLoading } = useVendor();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [searchValue, setSearchValue] = useState<string>("");
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "created_at",
    direction: "descending",
  });
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState<boolean>(false);

  const fetchItems = async (page: number) => {
    if (!vendor?.id) return;
    setLoading(true);
    try {
      const response: any = await api.get(`/products`, {
        params: {
          page,
          per_page: perPage,
          vendor_id: vendor.id,
          search: searchValue,
          sort_by: sortDescriptor.column,
          sort_direction:
            sortDescriptor.direction === "ascending" ? "asc" : "desc",
        },
      });

      setItems(response?.data?.data || []);
      setCurrentPage(response?.data?.current_page || 1);
      setLastPage(response?.data?.last_page || 1);
    } catch (error: any) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendor?.id) {
      fetchItems(currentPage);
    }
  }, [vendor?.id, currentPage, perPage, sortDescriptor, searchValue]);

  const handleDelete = async (id: number | "bulk") => {
    try {
      if (id === "bulk") {
        const ids = Array.from(selectedKeys);
        await api.post(`/products/bulk-delete`, { ids });
        toast.success(`${ids.length} products deleted successfully`);
        setSelectedKeys(new Set([]));
      } else {
        await api.delete(`/products/${id}`);
        toast.success("Product deleted successfully");
      }
      fetchItems(currentPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
    setDeleteConfirmOpen(false);
    setIsBulkDelete(false);
  };

  const renderCell = useCallback(
    (item: Product, columnKey: React.Key) => {
      switch (columnKey) {
        case "id":
          return `#${item.id}`;
        case "image":
          return <ProductImage alt={item.name} image_url={item.image_url} />;
        case "name":
          return (
            <Link
              className="text-primary hover:underline hover:underline-offset-4 capitalize"
              href={`/pos/vendor/${vendor?.id}/products/${item.id}`}
            >
              {item.name}
            </Link>
          );
        case "description":
          return (
            <div className="max-w-[200px] text-ellipsis overflow-hidden">
              {item.description}
            </div>
          );
        case "category":
          return (
            <Link
              className="text-primary hover:underline hover:underline-offset-4 capitalize"
              href={`/pos/vendor/${vendor?.id}/products/category${item.category_id}`}
            >
              {item.category_name}
            </Link>
          );
        case "unit_of_measure":
          return (
            <span>
              {item.unit_of_measure_name +
                " (" +
                item.unit_of_measure_abbreviation +
                ")"}
            </span>
          );
        case "created_at":
        case "updated_at":
        case "created_by":
        case "updated_by":
          return loggerColumns(columnKey, item);
        case "actions":
          return (
            <div className="flex items-center justify-end gap-2">
              <PermissionGuard permission="can_manage_catalog">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() =>
                    router.push(
                      `/pos/vendor/${vendor?.id}/products/${item.product_id}`
                    )
                  }
                >
                  <Pencil className="w-4 h-4 text-primary" />
                </Button>
              </PermissionGuard>
              <PermissionGuard permission="can_delete_catalog">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => {
                    setDeleteConfirmId(item.product_id);
                    setDeleteConfirmOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4 text-danger" />
                </Button>
              </PermissionGuard>
        default:
          return (item as any)[columnKey as keyof Product];
      }
    },
    [vendor?.id, router],
  );

  if (contextLoading) return <UserLoding />;

  return (
    <PermissionGuard permission="can_view_catalog">
      <div className="p-6">
        <PageHeader description="Manage your products and variants" title="Products">
          <PermissionGuard permission="can_manage_catalog">
            <Button
              color="primary"
              startContent={<Plus className="w-4 h-4" />}
              onPress={() =>
                router.push(`/pos/vendor/${vendor?.id}/products/new`)
              }
            >
              Add Product
            </Button>
          </PermissionGuard>
        </PageHeader>

        <div className="flex justify-between gap-3 items-end mb-4">
          <Input
            isClearable
            classNames={{ base: "w-full sm:max-w-[44%]" }}
            placeholder="Search products..."
            startContent={<SearchIcon />}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <div className="flex gap-3">
            {selectedKeys instanceof Set && selectedKeys.size > 0 && (
              <Button
                color="danger"
                startContent={<Trash2 className="w-4 h-4" />}
                variant="flat"
                onPress={() => {
                  setIsBulkDelete(true);
                  setDeleteConfirmOpen(true);
                }}
              >
                Delete Selected ({selectedKeys.size})
              </Button>
            )}
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
          visibleColumns={visibleColumns}
          onSelectionChange={setSelectedKeys}
        />

        <Confirm
          isOpen={deleteConfirmOpen}
          message={isBulkDelete ? `Are you sure you want to delete ${selectedKeys instanceof Set ? selectedKeys.size : 0} products?` : "Are you sure you want to delete this product?"}
          title={isBulkDelete ? "Bulk Delete Products" : "Delete Product"}
          onConfirm={(id) => handleDelete(id as number | "bulk")}
          onConfirmProp={isBulkDelete ? "bulk" : (deleteConfirmId || "")}
          onOpenChange={setDeleteConfirmOpen}
        />
      </div>
    </PermissionGuard>
  );
}
