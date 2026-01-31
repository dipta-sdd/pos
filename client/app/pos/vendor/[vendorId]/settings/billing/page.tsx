"use client";

import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@heroui/card";
import { CreditCard, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@heroui/button";

export default function BillingPage() {
  const { vendor, isLoading: contextLoading } = useVendor();

  if (contextLoading) return <div>Loading...</div>;
  if (!vendor) return null;

  return (
    <PermissionGuard permission="can_manage_billing_and_plan">
      <div className="p-6">
        <PageHeader title="Billing & Plan" description="Manage your subscription and billing details" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
                <CardBody className="p-6">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        Current Plan
                    </h3>

                    <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                        <div>
                            <p className="text-blue-600 dark:text-blue-400 font-semibold text-lg">{vendor.subscription_tier} Plan</p>
                            <p className="text-sm text-blue-500 dark:text-blue-300">Your next billing date is next month.</p>
                        </div>
                        <Button color="primary">Upgrade Plan</Button>
                    </div>

                    <div className="mt-8 space-y-4">
                        <h4 className="font-medium">Plan Features:</h4>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                Unlimited Sales & Transactions
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                Inventory Management
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                Multi-branch Support
                            </li>
                        </ul>
                    </div>
                </CardBody>
            </Card>

            <Card>
                <CardBody className="p-6">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        Payment Method
                    </h3>
                    <div className="p-4 border rounded-lg border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium">Visa ending in 4242</p>
                        <p className="text-xs text-gray-500">Expires 12/2025</p>
                    </div>
                    <Button variant="light" className="w-full mt-4" size="sm">Update Payment Method</Button>
                </CardBody>
            </Card>
        </div>
      </div>
    </PermissionGuard>
  );
}
