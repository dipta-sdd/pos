"use client";

import PurchaseOrderForm from "../_components/PurchaseOrderForm";

import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import { UserLoding } from "@/components/user-loding";

export default function NewPurchaseOrderPage() {
  const { vendor, isLoading: contextLoading } = useVendor();

  if (contextLoading) return <UserLoding />;

  return (
    <PermissionGuard permission="can_view_operations">
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
