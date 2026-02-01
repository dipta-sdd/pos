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
import { Customer } from "@/lib/types/general";

const columns: Column[] = [
  { name: "NAME", uid: "name", sortable: true },
  { name: "EMAIL", uid: "email", sortable: true },
  { name: "PHONE", uid: "phone", sortable: true },
  { name: "CREATED AT", uid: "created_at", sortable: true },
];

export default function CustomersPage() {
  const { vendor, isLoading: contextLoading } = useVendor();
  const [items, setItems] = useState<Customer[]>([]);
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
      const response = await api.get(`/customers`, {
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
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendor?.id) {
        fetchItems(currentPage);
    }
  }, [vendor?.id, currentPage, perPage, sortDescriptor, searchValue]);

  const renderCell = useCallback((item: Customer, columnKey: React.Key) => {
    if (columnKey === "name") {
        if (item.name) return item.name;
        return `${item.first_name || ""} ${item.last_name || ""}`.trim() || "N/A";
    }
    return (item as any)[columnKey as keyof Customer];
  }, []);

  if (contextLoading) return <div>Loading...</div>;

  return (
    <PermissionGuard permission="can_view_customers">
      <div className="p-6">
        <PageHeader title="Customers" description="Manage your customer database">
            <Button color="primary" startContent={<Plus className="w-4 h-4" />}>
                Add Customer
            </Button>
        </PageHeader>

        <div className="flex justify-between gap-3 items-end mb-4">
          <Input
            isClearable
            classNames={{ base: "w-full sm:max-w-[44%]" }}
            placeholder="Search customers..."
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
