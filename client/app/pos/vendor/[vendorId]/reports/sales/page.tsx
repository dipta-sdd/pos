"use client";

import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@heroui/card";
import { LineChart, Download, Filter } from "lucide-react";
import { Button } from "@heroui/button";

export default function SalesReportPage() {
  const { vendor, isLoading: contextLoading } = useVendor();

  if (contextLoading) return <div>Loading...</div>;

  return (
    <PermissionGuard permission="can_view_reports">
      <div className="p-6">
        <PageHeader title="Sales Reports" description="Analyze your sales performance and trends">
            <div className="flex gap-2">
                <Button variant="flat" startContent={<Filter className="w-4 h-4" />}>Filter</Button>
                <Button variant="flat" startContent={<Download className="w-4 h-4" />}>Export</Button>
            </div>
        </PageHeader>

        <Card className="mb-8">
            <CardBody className="p-12 flex flex-col items-center justify-center text-gray-400 min-h-[400px]">
                <LineChart className="w-20 h-20 mb-4 opacity-10" />
                <p className="text-xl font-medium">Sales chart will appear here</p>
                <p className="max-w-xs text-center mt-2">Start processing sales to see your business growth visualized.</p>
            </CardBody>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardBody className="p-6">
                    <h3 className="font-bold mb-4">Top Products</h3>
                    <p className="text-gray-500 text-sm italic">No data to display</p>
                </CardBody>
            </Card>
            <Card>
                <CardBody className="p-6">
                    <h3 className="font-bold mb-4">Sales by Category</h3>
                    <p className="text-gray-500 text-sm italic">No data to display</p>
                </CardBody>
            </Card>
        </div>
      </div>
    </PermissionGuard>
  );
}
