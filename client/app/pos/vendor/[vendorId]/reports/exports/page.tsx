"use client";

import { Card, CardBody } from "@heroui/card";
import { FileDown, Table, FileJson, FileIcon as FilePdf } from "lucide-react";
import { Button } from "@heroui/button";

import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import { UserLoding } from "@/components/user-loding";

const exportTypes = [
  { name: "Full Sales Data", icon: Table, format: "CSV/Excel" },
  { name: "Inventory Audit", icon: FileJson, format: "JSON/CSV" },
  { name: "Customer List", icon: Table, format: "CSV" },
  { name: "Tax Report", icon: FilePdf, format: "PDF" },
];

export default function DataExportsPage() {
  const { vendor, isLoading: contextLoading } = useVendor();

  if (contextLoading) return <UserLoding />;

  return (
    <PermissionGuard permission="can_view_financial_analytics">
      <div className="p-6">
        <PageHeader
          description="Export your business data in various formats"
          title="Data Exports"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exportTypes.map((type) => (
            <Card
              key={type.name}
              isPressable
              className="hover:border-primary transition-colors border-2 border-transparent"
            >
              <CardBody className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-primary">
                    <type.icon />
                  </div>
                  <div>
                    <h3 className="font-bold">{type.name}</h3>
                    <p className="text-sm text-gray-500">
                      Format: {type.format}
                    </p>
                  </div>
                </div>
                <Button
                  color="primary"
                  startContent={<FileDown className="w-4 h-4" />}
                  variant="flat"
                >
                  Download
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </PermissionGuard>
  );
}
