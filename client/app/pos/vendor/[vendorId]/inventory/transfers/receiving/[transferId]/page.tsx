"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@heroui/skeleton";

import CreateReceivingTransferForm from "../../_components/CreateReceivingTransferForm";
import RequestedReceivingTransferForm from "../../_components/RequestedReceivingTransferForm";
import ShippedReceivingTransferForm from "../../_components/ShippedReceivingTransferForm";
import ViewReceivingTransfer from "../../_components/ViewReceivingTransfer";

import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import api from "@/lib/api";
import ResourceNotFound from "@/components/ui/ResourceNotFound";
import { StockTransfer } from "@/lib/types/general";

export default function ReceivingTransferPage() {
  const { vendor, isLoading: contextLoading } = useVendor();
  const params = useParams();
  const transferId = params.transferId;
  const vendorId = params.vendorId;

  const [transfer, setTransfer] = useState<StockTransfer | null>(null);
  const [loading, setLoading] = useState(transferId !== "new");

  useEffect(() => {
    if (transferId && transferId !== "new") {
      fetchTransfer();
    }
  }, [transferId]);

  const fetchTransfer = async () => {
    try {
      const response: any = await api.get(`/stock-transfers/${transferId}`);

      setTransfer(response?.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (contextLoading || loading)
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    );

  if (transferId !== "new" && !transfer) {
    return (
      <ResourceNotFound
        backLabel="Back"
        backLink={`/pos/vendor/${vendorId}/inventory/transfers/receiving`}
        title="Incoming Transfer"
      />
    );
  }

  const renderComponent = () => {
    if (transferId === "new") {
      return <CreateReceivingTransferForm />;
    }

    switch (transfer?.status) {
      case "requested":
        return (
          <RequestedReceivingTransferForm
            initialData={transfer}
            setInitialData={setTransfer}
          />
        );
      case "shipped":
        return (
          <ShippedReceivingTransferForm
            initialData={transfer}
            setInitialData={setTransfer}
          />
        );
      case "accepted":
      case "in_transit":
      case "completed":
      case "cancelled":
      case "rejected":
        return (
          <ViewReceivingTransfer
            initialData={transfer}
            setInitialData={setTransfer}
          />
        );
      default:
        return <div>Unknown Status</div>;
    }
  };

  return (
    <PermissionGuard permission="can_view_stock_and_inventory">
      <div className="p-6 space-y-6">{renderComponent()}</div>
    </PermissionGuard>
  );
}
