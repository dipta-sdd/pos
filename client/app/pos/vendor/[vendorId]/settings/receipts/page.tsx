"use client";

import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Printer, FileText } from "lucide-react";

import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";

export default function ReceiptSettingsPage() {
  const { vendor, isLoading: contextLoading } = useVendor();

  if (contextLoading) return <div>Loading...</div>;

  return (
    <PermissionGuard permission="can_customize_receipts">
      <div className="p-6">
        <PageHeader
          description="Customize your sales receipts"
          title="Receipt Settings"
        >
          <Button color="primary">Save Settings</Button>
        </PageHeader>

        <div className="max-w-4xl">
          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Printer className="w-5 h-5 text-primary" />
                Receipt Customization
              </h3>
              <div className="space-y-6">
                <div className="p-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 font-medium">Receipt Preview</p>
                  <p className="text-sm text-gray-400">
                    Configure your receipt header, footer, and logo
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="headerText">
                      Header Text
                    </label>
                    <textarea
                      className="w-full p-2 border rounded-md min-h-[100px]"
                      id="headerText"
                      placeholder="Enter receipt header..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="footerText">
                      Footer Text
                    </label>
                    <textarea
                      className="w-full p-2 border rounded-md min-h-[100px]"
                      id="footerText"
                      placeholder="Enter receipt footer..."
                    />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </PermissionGuard>
  );
}
