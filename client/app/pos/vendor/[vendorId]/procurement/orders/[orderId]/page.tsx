"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@heroui/skeleton";

import PurchaseOrderForm from "../_components/PurchaseOrderForm";

import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import api from "@/lib/api";
import ResourceNotFound from "@/components/ui/ResourceNotFound";

export default function EditPurchaseOrderPage() {
  const { vendor, isLoading: contextLoading } = useVendor();
  const params = useParams();
  const orderId = params.orderId;
  const vendorId = params.vendorId;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response: any = await api.get(`/purchase-orders/${orderId}`);

      setOrder(response?.data);
    } catch (error) {
      console.error("Failed to fetch order", error);
    } finally {
      setLoading(false);
    }
  };

  if (contextLoading || loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-3">
            <Skeleton className="w-64 h-8 rounded-lg" />
            <Skeleton className="w-48 h-4 rounded-lg" />
          </div>
        </div>
        <div className="mt-6 max-w-5xl space-y-8">
          {/* General Information Card */}
          <div className="bg-white dark:bg-default-50 rounded-xl border border-default-200 p-6 space-y-6">
            <Skeleton className="w-48 h-6 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>

          {/* Order Items Card */}
          <div className="bg-white dark:bg-default-50 rounded-xl border border-default-200 p-6 space-y-6">
            <div className="flex justify-between items-center">
              <Skeleton className="w-32 h-6 rounded-lg" />
              <Skeleton className="w-32 h-8 rounded-lg" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end pb-4 border-b border-default-100 last:border-0"
                >
                  <div className="md:col-span-6">
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                  <div className="md:col-span-2">
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                  <div className="md:col-span-3">
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                  <div className="md:col-span-1">
                    <Skeleton className="h-8 w-8 rounded-lg mx-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              <Skeleton className="w-24 h-4 rounded" />
              <Skeleton className="w-32 h-10 rounded-lg" />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Skeleton className="h-12 w-24 rounded-lg flex-1 md:flex-none" />
              <Skeleton className="h-12 w-32 rounded-lg flex-1 md:flex-none" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <ResourceNotFound
        backLabel="Back to Orders"
        backLink={`/pos/vendor/${vendorId}/procurement/orders`}
        title="Purchase Order"
      />
    );
  }

  return (
    <PermissionGuard permission="can_view_operations">
      <div className="p-6">
        <PageHeader
          description={`Viewing Order #${order.id}`}
          title="Edit Purchase Order"
        />
        <div className="mt-6 max-w-5xl">
          <PurchaseOrderForm isEditing initialData={order} />
        </div>
      </div>
    </PermissionGuard>
  );
}
