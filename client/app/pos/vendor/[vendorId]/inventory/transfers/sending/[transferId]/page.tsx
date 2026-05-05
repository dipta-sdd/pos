"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@heroui/skeleton";

import CreateSendingTransferForm from "../../_components/CreateSendingTransferForm";
import RequestedSendingTransferForm from "../../_components/RequestedSendingTransferForm";
import AcceptedSendingTransferForm from "../../_components/AcceptedSendingTransferForm";
import ViewSendingTransfer from "../../_components/ViewSendingTransfer";

import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import api from "@/lib/api";
import ResourceNotFound from "@/components/ui/ResourceNotFound";
import { StockTransfer } from "@/lib/types/general";

export default function SendingTransferPage() {
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
        backLink={`/pos/vendor/${vendorId}/inventory/transfers/sending`}
        title="Outgoing Transfer"
      />
    );
  }

  const renderComponent = () => {
    if (transferId === "new") {
      return <CreateSendingTransferForm />;
    }

    switch (transfer?.status) {
      case "requested":
        return (
          <RequestedSendingTransferForm
            initialData={transfer}
            setInitialData={setTransfer}
          />
        );
      case "accepted":
        return (
          <AcceptedSendingTransferForm
            initialData={transfer}
            setInitialData={setTransfer}
          />
        );
      case "in_transit":
      case "shipped":
      case "completed":
      case "cancelled":
      case "rejected":
        return <ViewSendingTransfer initialData={transfer} />;
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
