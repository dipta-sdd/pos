"use client";

import { useState, useCallback, useEffect } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { SearchIcon } from "@/components/icons";
import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import CustomTable, { Column } from "@/components/ui/CustomTable";
import { SortDescriptor } from "@heroui/table";
import api from "@/lib/api";
import { Plus } from "lucide-react";
import { PaymentMethod } from "@/lib/types/general";

const columns: Column[] = [
  { name: "NAME", uid: "name", sortable: true },
  { name: "IS ACTIVE", uid: "is_active", sortable: true },
  { name: "CREATED AT", uid: "created_at", sortable: true },
];

export default function PaymentMethodsPage() {
  const { vendor, isLoading: contextLoading } = useVendor();
  const [items, setItems] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "created_at",
    direction: "descending",
  });

  const fetchItems = async (page: number) => {
    if (!vendor?.id) return;
    setLoading(true);
    try {
      const response = await api.get(`/payment-methods`, {
        params: {
          page,
          per_page: perPage,
          vendor_id: vendor.id,
          search: searchValue,
          sort_by: sortDescriptor.column,
          sort_direction: sortDescriptor.direction === "ascending" ? "asc" : "desc",
        },
      });
      setItems(response.data.data);
      setCurrentPage(response.data.current_page);
      setLastPage(response.data.last_page);
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendor?.id) {
        fetchItems(currentPage);
    }
  }, [vendor?.id, currentPage, perPage, sortDescriptor, searchValue]);

  const renderCell = useCallback((item: PaymentMethod, columnKey: React.Key) => {
    if (columnKey === "is_active") return item.is_active ? "Yes" : "No";
    return (item as any)[columnKey as keyof PaymentMethod];
  }, []);

  if (contextLoading) return <div>Loading...</div>;

  return (
    <PermissionGuard permission="can_manage_payment_methods">
      <div className="p-6">
        <PageHeader title="Payment Methods" description="Configure accepted payment methods">
            <Button color="primary" startContent={<Plus className="w-4 h-4" />}>
                Add Method
            </Button>
        </PageHeader>

        <div className="flex justify-between gap-3 items-end mb-4">
          <Input
            isClearable
            classNames={{ base: "w-full sm:max-w-[44%]" }}
            placeholder="Search methods..."
            startContent={<SearchIcon />}
            value={searchValue}
            onValueChange={setSearchValue}
          />
        </div>

        <CustomTable
          columns={columns}
          items={items}
          isLoading={loading}
          currentPage={currentPage}
          lastPage={lastPage}
          perPage={perPage}
          setPerPage={setPerPage}
          setCurrentPage={setCurrentPage}
          sortDescriptor={sortDescriptor}
          setSortDescriptor={setSortDescriptor}
          renderCell={renderCell}
        />
      </div>
    </PermissionGuard>
  );
}
