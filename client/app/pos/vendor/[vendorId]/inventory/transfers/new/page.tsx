"use client";

import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import StockTransferForm from "../_components/StockTransferForm";

export default function NewStockTransferPage() {
  const { vendor, isLoading: contextLoading } = useVendor();

  if (contextLoading) return <div>Loading...</div>;

  return (
    <PermissionGuard permission="can_manage_stock_transfers">
      <div className="p-6">
        <PageHeader
          description="Create a new stock transfer between branches"
          title="New Transfer"
        />
        <div className="mt-6 max-w-5xl">
          <StockTransferForm />
        </div>
      </div>
    </PermissionGuard>
  );
}
