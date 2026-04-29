"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@heroui/skeleton";
import { Card, CardBody } from "@heroui/react";

import StockTransferForm from "../_components/StockTransferForm";
import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import api from "@/lib/api";
import ResourceNotFound from "@/components/ui/ResourceNotFound";
import { StockTransfer } from "@/lib/types/general";

export default function StockTransferPage() {
  const { vendor, isLoading: contextLoading } = useVendor();
  const params = useParams();
  const transferId = params.transferId;
  const vendorId = params.vendorId;

  const [transfer, setTransfer] = useState<StockTransfer | null>(null);
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
        <Skeleton className="w-64 h-10 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardBody className="gap-3">
              <Skeleton className="h-4 w-1/3 rounded-lg" />
              <Skeleton className="h-4 w-1/4 rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </CardBody>
          </Card>
          <Card className="md:col-span-2">
            <CardBody className="gap-3">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-40 w-full rounded-lg" />
            </CardBody>
          </Card>
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
      <div className="p-6 space-y-6">
        <StockTransferForm
          isEditing
          initialData={transfer}
          setInitialData={setTransfer}
        />
      </div>
    </PermissionGuard>
  );
}
