"use client";

import { Card, CardBody } from "@heroui/card";
import { BarChart3, TrendingUp, Download } from "lucide-react";
import { Button } from "@heroui/button";

import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";

export default function BillsReportPage() {
  const { vendor, isLoading: contextLoading } = useVendor();

  if (contextLoading) return <div>Loading...</div>;

  return (
    <PermissionGuard permission="can_view_reports">
      <div className="p-6">
        <PageHeader
          description="Detailed financial reports and billings"
          title="Financial Ledger"
        >
          <Button
            startContent={<Download className="w-4 h-4" />}
            variant="flat"
          >
            Export PDF
          </Button>
        </PageHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardBody className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600">
                <TrendingUp />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold">$0.00</p>
              </div>
            </CardBody>
          </Card>
          {/* Add more cards for other metrics */}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 flex flex-col items-center justify-center text-gray-400">
          <BarChart3 className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg font-medium">
            No financial data available for the selected period.
          </p>
        </div>
      </div>
    </PermissionGuard>
  );
}
