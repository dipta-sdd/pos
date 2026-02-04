"use client";

import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import ProductForm from "../_components/ProductForm";

export default function NewProductPage() {
  const { vendor, isLoading: contextLoading } = useVendor();

  if (contextLoading) return <div>Loading...</div>;

  return (
    <PermissionGuard permission="can_manage_products">
      <div className="p-6">
        <PageHeader
          description="Add a new product to your catalog"
          title="Add Product"
        />
        <div className="mt-6 max-w-5xl">
          <ProductForm />
        </div>
      </div>
    </PermissionGuard>
  );
}
