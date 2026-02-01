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
import { Wallet } from "lucide-react";
import { CashRegisterSession } from "@/lib/types/general";

const columns: Column[] = [
  { name: "SESSION ID", uid: "id", sortable: true },
  { name: "OPENED BY", uid: "user", sortable: false },
  { name: "OPENED AT", uid: "started_at", sortable: true },
  { name: "CLOSED AT", uid: "ended_at", sortable: true },
  { name: "STATUS", uid: "status", sortable: true },
];

export default function CashManagementPage() {
  const { vendor, isLoading: contextLoading } = useVendor();
  const [items, setItems] = useState<CashRegisterSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "started_at",
    direction: "descending",
  });

  const fetchItems = async (page: number) => {
    if (!vendor?.id) return;
    setLoading(true);
    try {
      const response = await api.get(`/cash-register-sessions`, {
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
      console.error("Failed to fetch cash sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendor?.id) {
        fetchItems(currentPage);
    }
  }, [vendor?.id, currentPage, perPage, sortDescriptor, searchValue]);

  const renderCell = useCallback((item: CashRegisterSession, columnKey: React.Key) => {
    if (columnKey === "user") return item.user?.name || "N/A";
    return (item as any)[columnKey as keyof CashRegisterSession];
  }, []);

  if (contextLoading) return <div>Loading...</div>;

  return (
    <PermissionGuard permission="can_open_close_cash_register">
      <div className="p-6">
        <PageHeader title="Cash Management" description="Open/Close register and track cash sessions">
            <Button color="success" className="text-white font-bold" startContent={<Wallet className="w-4 h-4" />}>
                Open Register
            </Button>
        </PageHeader>

        <div className="flex justify-between gap-3 items-end mb-4">
          <Input
            isClearable
            classNames={{ base: "w-full sm:max-w-[44%]" }}
            placeholder="Search sessions..."
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
