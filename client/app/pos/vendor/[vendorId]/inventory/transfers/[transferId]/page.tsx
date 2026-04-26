"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import StockTransferForm from "../_components/StockTransferForm";

import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import api from "@/lib/api";

export default function EditStockTransferPage() {
  const { vendor, isLoading: contextLoading } = useVendor();
  const params = useParams();
  const transferId = params.transferId;
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

  if (contextLoading || loading) return <div className="p-6">Loading...</div>;
  if (!transfer) return <div className="p-6">Transfer not found.</div>;

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
