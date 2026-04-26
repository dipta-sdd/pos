"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  CreditCard,
  Package,
  User,
  Building2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@heroui/react";

import { UserInfo } from "@/components/user-info";
import { useAuth } from "@/lib/hooks/useAuth";
import { useVendor } from "@/lib/contexts/VendorContext";
import { UserLoding } from "@/components/user-loding";

interface Vendor {
  id: number;
  name: string;
  description: string;
  subscription_tier: string;
  currency: string;
  timezone: string;
}

interface Membership {
  id: number;
  vendor: Vendor;
  role: {
    name: string;
    can_use_pos: boolean;
    can_view_reports: boolean;
  };
}

export default function VendorPOS() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading } = useAuth();
  const { selectedBranchIds } = useVendor();
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [userMembership, setUserMembership] = useState<Membership | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && user) {
      const vendorId = parseInt(params.vendorId as string);
      const membership = user?.memberships?.find(
        (m) => m.vendor.id === vendorId,
      );

      if (!membership) {
        router.push("/pos");

        return;
      }

      if (!membership.role.can_use_pos) {
        router.push("/pos");

        return;
      }

      setSelectedVendor(membership.vendor);
      setUserMembership(membership);
      fetchStats(vendorId, selectedBranchIds);
    }
  }, [user, isLoading, params.vendorId, router, selectedBranchIds]);

  const fetchStats = async (vendorId: number, branchIds: string[]) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("vendor_id", vendorId.toString());
      branchIds.forEach(id => queryParams.append("branch_ids[]", id));

      const response: any = await import("@/lib/api").then((m) =>
        m.default.get(`/dashboard/stats?${queryParams.toString()}`),
      );
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
    } finally {
      setStatsLoading(false);
    }
  };

  if (isLoading) {
    return <UserLoding />;
  }

  if (!selectedVendor || !userMembership) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              onClick={() => router.push("/pos")}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Vendor Selection
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center shrink-0">
                <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedVendor.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Welcome back, {user?.firstName}! Here&apos;s what&apos;s
                  happening with {selectedVendor.name} today.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    {userMembership.role.name}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    {selectedVendor.subscription_tier}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                color="primary"
                size="lg"
                startContent={<CreditCard className="w-5 h-5" />}
                onPress={() =>
                  router.push(`/pos/vendor/${selectedVendor.id}/pos`)
                }
              >
                New Sale
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="lg:col-span-1">
            <UserInfo />
          </div>

          {/* Dashboard Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Today&apos;s Sales
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedVendor.currency === "USD" ? "$" : stats?.currency_symbol || ""}
                      {stats ? Number(stats.today_sales).toLocaleString() : "0"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Today&apos;s Expenses
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedVendor.currency === "USD" ? "$" : stats?.currency_symbol || ""}
                      {stats ? Number(stats.today_expenses).toLocaleString() : "0"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Net Income
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedVendor.currency === "USD" ? "$" : stats?.currency_symbol || ""}
                      {stats ? Number(stats.net_income).toLocaleString() : "0"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Products
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats?.total_products || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Today&apos;s Orders
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats?.today_transactions || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => router.push(`/pos/vendor/${selectedVendor.id}/pos`)}
                >
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    New Sale
                  </span>
                </button>

                <button 
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => router.push(`/pos/vendor/${selectedVendor.id}/products/new`)}
                >
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Add Product
                  </span>
                </button>

                <button 
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => router.push(`/pos/vendor/${selectedVendor.id}/customers`)}
                >
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Add Customer
                  </span>
                </button>

                <button 
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => router.push(`/pos/vendor/${selectedVendor.id}/settings`)}
                >
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Settings
                  </span>
                </button>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Activity
                </h3>
                <Button 
                  size="sm" 
                  variant="light"
                  onPress={() => router.push(`/pos/vendor/${selectedVendor.id}/sales`)}
                >
                  History
                </Button>
              </div>
              
              <div className="space-y-4">
                {stats?.recent_activity?.map((activity: any, idx: number) => (
                  <div key={`${activity.type}-${activity.id}-${idx}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      activity.type === 'sale' ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' : 
                      'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                    }`}>
                      {activity.type === 'sale' ? <CreditCard size={18} /> : <BarChart3 size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {activity.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-black ${
                        activity.type === 'sale' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {activity.type === 'sale' ? '+' : '-'}{stats.currency_symbol}{Number(activity.amount).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {!stats?.recent_activity?.length && (
                  <div className="py-12 text-center text-gray-500">
                    No recent activity found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
