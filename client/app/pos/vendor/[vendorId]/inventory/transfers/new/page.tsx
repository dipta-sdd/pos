"use client";

import StockTransferForm from "../_components/StockTransferForm";

import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import { UserLoding } from "@/components/user-loding";

export default function NewStockTransferPage() {
  const { vendor, isLoading: contextLoading } = useVendor();

  if (contextLoading) return <UserLoding />;

  return (
    <PermissionGuard permission="can_view_stock_and_inventory">
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
