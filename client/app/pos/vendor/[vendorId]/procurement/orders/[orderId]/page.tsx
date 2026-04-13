"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import PurchaseOrderForm from "../_components/PurchaseOrderForm";

import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import api from "@/lib/api";

export default function EditPurchaseOrderPage() {
  const { vendor, isLoading: contextLoading } = useVendor();
  const params = useParams();
  const orderId = params.orderId;
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

  if (contextLoading || loading) return <div className="p-6">Loading...</div>;
  if (!order) return <div className="p-6">Order not found.</div>;

  return (
    <PermissionGuard permission="can_view_purchase_orders">
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
