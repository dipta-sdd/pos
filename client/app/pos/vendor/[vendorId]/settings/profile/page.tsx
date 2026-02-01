"use client";

import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Building2, Globe, Clock } from "lucide-react";

import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";

export default function BusinessProfilePage() {
  const { vendor, isLoading: contextLoading } = useVendor();

  if (contextLoading) return <div>Loading...</div>;
  if (!vendor) return null;

  return (
    <PermissionGuard permission="can_manage_shop_settings">
      <div className="p-6">
        <PageHeader
          description="Manage your shop details and public information"
          title="Business Profile"
        >
          <Button color="primary">Update Profile</Button>
        </PageHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                General Information
              </h3>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500 block">
                    Business Name
                  </span>
                  <p className="font-medium">{vendor.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block">
                    Description
                  </span>
                  <p className="font-medium">
                    {vendor.description || "No description provided"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block">
                    Subscription Tier
                  </span>
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mt-1">
                    {vendor.subscription_tier}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Localization
              </h3>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500 block flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Timezone
                  </span>
                  <p className="font-medium">{vendor.timezone}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block">Currency</span>
                  <p className="font-medium">{vendor.currency}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </PermissionGuard>
  );
}
