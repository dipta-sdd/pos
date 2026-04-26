"use client";

import { Card, CardBody } from "@heroui/card";
import { PlugZap, CheckCircle2 } from "lucide-react";
import { Button } from "@heroui/button";

import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import { UserLoding } from "@/components/user-loding";

const integrations = [
  {
    name: "QuickBooks",
    description: "Sync your sales data with QuickBooks Online",
    connected: false,
  },
  {
    name: "Xero",
    description: "Connect to Xero for automated accounting",
    connected: false,
  },
  {
    name: "Mailchimp",
    description: "Sync customer emails for marketing campaigns",
    connected: false,
  },
  {
    name: "WhatsApp",
    description: "Send receipts via WhatsApp",
    connected: true,
  },
];

export default function IntegrationsPage() {
  const { vendor, isLoading: contextLoading } = useVendor();

  if (contextLoading) return <UserLoding />;

  return (
    <PermissionGuard permission="can_edit_organization_settings">
      <div className="p-6">
        <PageHeader
          description="Connect your POS with other business tools"
          title="Integrations"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((app) => (
            <Card key={app.name}>
              <CardBody className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <PlugZap className="w-6 h-6 text-primary" />
                  </div>
                  {app.connected && (
                    <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Connected
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-lg mb-1">{app.name}</h3>
                <p className="text-sm text-gray-500 mb-6">{app.description}</p>
                <Button
                  className="w-full"
                  color={app.connected ? "default" : "primary"}
                  variant={app.connected ? "flat" : "solid"}
                >
                  {app.connected ? "Configure" : "Connect"}
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </PermissionGuard>
  );
}
