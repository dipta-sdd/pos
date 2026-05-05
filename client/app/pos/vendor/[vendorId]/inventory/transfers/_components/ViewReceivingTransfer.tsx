"use client";

import { Card, CardBody, Chip, Button } from "@heroui/react";
import { Clock, User, Package, MapPin } from "lucide-react";
import { toast } from "sonner";

import { formatDate } from "@/lib/helper/dates";
import api from "@/lib/api";
import { StockTransfer } from "@/lib/types/general";

interface ViewReceivingTransferProps {
  initialData: StockTransfer;
  setInitialData: React.Dispatch<React.SetStateAction<StockTransfer | null>>;
}

const statusColorMap: any = {
  requested: "default",
  accepted: "primary",
  in_transit: "secondary",
  shipped: "warning",
  completed: "success",
  cancelled: "danger",
  rejected: "danger",
};

const statusLabelMap: any = {
  requested: "Requested",
  accepted: "Accepted",
  in_transit: "In Transit",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

export default function ViewReceivingTransfer({
  initialData,
  setInitialData,
}: ViewReceivingTransferProps) {
  const updateGlobalStatus = async (newStatus: string) => {
    try {
      await api.post(`/stock-transfers/${initialData.id}/status`, {
        status: newStatus,
      });
      toast.success(`Transfer marked as ${newStatus}`);
      setInitialData((prev) => ({
        ...(prev as StockTransfer),
        status: newStatus,
      }));
    } catch (error: any) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Incoming Transfer ST-{initialData.id}
            </h1>
            <Chip color={statusColorMap[initialData.status]} variant="flat">
              {statusLabelMap[initialData.status] || initialData.status}
            </Chip>
          </div>
          <p className="text-default-400 text-sm flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Created on{" "}
              {formatDate(initialData.created_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> by{" "}
              {initialData.created_by?.firstName}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {initialData.status === "in_transit" && (
            <Button
              color="secondary"
              onPress={() => updateGlobalStatus("shipped")}
            >
              Mark Shipped
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm">
          <CardBody className="p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-default-500 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> From Branch
                </p>
                <p className="font-medium text-lg">
                  {initialData.from_branch?.name}
                </p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-sm text-default-500 flex items-center gap-1.5 justify-end">
                  <MapPin className="w-4 h-4" /> To Branch
                </p>
                <p className="font-medium text-lg">
                  {initialData.to_branch?.name}
                </p>
              </div>
            </div>
            {initialData.notes && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-default-500 mb-1">Notes</p>
                <p className="text-sm">{initialData.notes}</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <CardBody className="p-0">
          <div className="p-6 border-b bg-default-50/50 flex items-center gap-2">
            <Package className="w-5 h-5 text-default-500" />
            <h3 className="font-semibold text-lg">Transfer Items</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-default-50/50">
                  <th className="py-4 px-6 font-semibold text-sm">
                    Product Details
                  </th>
                  <th className="py-4 px-6 font-semibold text-sm text-center">
                    Requested
                  </th>
                  <th className="py-4 px-6 font-semibold text-sm text-center">
                    Approved
                  </th>
                  <th className="py-4 px-6 font-semibold text-sm text-center">
                    Received
                  </th>
                  <th className="py-4 px-6 font-semibold text-sm text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {initialData.stock_transfer_items?.map((item: any) => {
                  const unit =
                    item.unit_of_measure?.abbreviation ||
                    item.variant?.unit_of_measure?.abbreviation;
                  const isOutOfStock = item.status === "out_of_stock";

                  return (
                    <tr
                      key={item.id}
                      className={`border-b hover:bg-default-50/50 ${isOutOfStock ? "opacity-50" : ""}`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-sm">
                            {item.variant?.product?.name}
                          </span>
                          <span className="text-xs text-default-500">
                            {item.variant?.value}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="font-medium text-lg">
                          {item.quantity}
                        </span>
                        <span className="text-default-400 text-xs ml-1">
                          {unit}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="font-medium text-lg">
                          {item.approved_quantity ?? "-"}
                        </span>
                        {item.approved_quantity !== null && (
                          <span className="text-default-400 text-xs ml-1">
                            {unit}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="font-medium text-lg">
                          {item.received_quantity ?? "-"}
                        </span>
                        {item.received_quantity !== null && (
                          <span className="text-default-400 text-xs ml-1">
                            {unit}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Chip
                          color={isOutOfStock ? "danger" : "default"}
                          size="sm"
                          variant="flat"
                        >
                          {isOutOfStock
                            ? "Out of Stock"
                            : item.status || initialData.status}
                        </Chip>
                      </td>
                    </tr>
                  );
                })}
                {(!initialData.stock_transfer_items ||
                  initialData.stock_transfer_items.length === 0) && (
                  <tr>
                    <td
                      className="py-8 text-center text-default-400"
                      colSpan={5}
                    >
                      No items found in this transfer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
