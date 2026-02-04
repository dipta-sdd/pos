"use client";

import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import PurchaseOrderForm from "../_components/PurchaseOrderForm";

export default function NewPurchaseOrderPage() {
  const { vendor, isLoading: contextLoading } = useVendor();

  if (contextLoading) return <div>Loading...</div>;

  return (
    <PermissionGuard permission="can_manage_purchase_orders">
      <div className="p-6">
        <PageHeader
          description="Create a new purchase order for a supplier"
          title="New Order"
        />
        <div className="mt-6 max-w-5xl">
          <PurchaseOrderForm />
        </div>
      </div>
    </PermissionGuard>
  );
}
