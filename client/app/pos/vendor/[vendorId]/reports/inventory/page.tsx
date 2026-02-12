"use client";

import { Card, CardBody } from "@heroui/card";
import { PieChart, Download, AlertTriangle } from "lucide-react";
import { Button } from "@heroui/button";

import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import { UserLoding } from "@/components/user-loding";

export default function InventoryReportPage() {
  const { vendor, isLoading: contextLoading } = useVendor();

  if (contextLoading) return <UserLoding />;

  return (
    <PermissionGuard permission="can_view_reports">
      <div className="p-6">
        <PageHeader
          description="Overview of stock levels and inventory value"
          title="Inventory Reports"
        >
          <Button
            startContent={<Download className="w-4 h-4" />}
            variant="flat"
          >
            Export CSV
          </Button>
        </PageHeader>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-800">
            <CardBody className="p-4 flex items-center gap-4">
              <AlertTriangle className="text-orange-500" />
              <div>
                <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">
                  Low Stock
                </p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </CardBody>
          </Card>
          {/* More stat cards */}
        </div>

        <Card className="p-12 min-h-[400px]">
          <CardBody className="flex flex-col items-center justify-center text-gray-400">
            <PieChart className="w-20 h-20 mb-4 opacity-10" />
            <p className="text-xl font-medium">Inventory distribution chart</p>
          </CardBody>
        </Card>
      </div>
    </PermissionGuard>
  );
}
