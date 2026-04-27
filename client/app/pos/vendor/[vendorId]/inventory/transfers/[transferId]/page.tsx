"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import StockTransferForm from "../_components/StockTransferForm";

import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import api from "@/lib/api";
import ResourceNotFound from "@/components/ui/ResourceNotFound";
import { Skeleton } from "@heroui/skeleton";

export default function EditStockTransferPage() {
  const { vendor, isLoading: contextLoading } = useVendor();
  const params = useParams();
  const transferId = params.transferId;
  const vendorId = params.vendorId;
  const [transfer, setTransfer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (transferId) {
      fetchTransfer();
    }
  }, [transferId]);

  const fetchTransfer = async () => {
    try {
      const response: any = await api.get(`/stock-transfers/${transferId}`);

      setTransfer(response?.data);
    } catch (error) {
      console.error("Failed to fetch transfer", error);
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
          {/* Transfer Details Card */}
          <div className="bg-white dark:bg-default-50 rounded-xl border border-default-200 p-6 space-y-6">
            <Skeleton className="w-40 h-6 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <div className="md:col-span-2">
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            </div>
          </div>

          {/* Items Card */}
          <div className="bg-white dark:bg-default-50 rounded-xl border border-default-200 p-6 space-y-6">
            <div className="flex justify-between items-center">
              <Skeleton className="w-24 h-6 rounded-lg" />
              <Skeleton className="w-32 h-8 rounded-lg" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end pb-4 border-b border-default-100 last:border-0">
                  <div className="md:col-span-8">
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

          <div className="flex justify-end gap-3">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!transfer) {
    return (
      <ResourceNotFound
        title="Stock Transfer"
        backLink={`/pos/vendor/${vendorId}/inventory/transfers`}
        backLabel="Back to Transfers"
      />
    );
  }

  return (
    <PermissionGuard permission="can_view_stock_and_inventory">
      <div className="p-6">
        <PageHeader
          description={`Viewing Transfer #${transfer.id}`}
          title="Edit Stock Transfer"
        />
        <div className="mt-6 max-w-5xl">
          <StockTransferForm isEditing initialData={transfer} />
        </div>
      </div>
    </PermissionGuard>
  );
}
