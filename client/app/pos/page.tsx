"use client";

import { useRouter } from "next/navigation";
import {
  Building2,
  Store,
  ArrowRight,
  Plus,
  Sparkles,
  Users,
  Shield,
} from "lucide-react";

import { UserInfo } from "@/components/user-info";
import { useAuth } from "@/lib/hooks/useAuth";
import { Navbar2 } from "@/components/navbar2";
import { UserLoding } from "@/components/user-loding";

export default function POS() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const handleVendorSelect = (vendorId: number) => {
    router.push(`/pos/${vendorId}`);
  };

  const handleCreateVendor = () => {
    router.push("/pos/onboarding");
  };

  if (!isLoading && !user) {
    router.push("/login");
  }
  if (!isLoading && user && !user?.memberships.length) {
    router.push("/pos/onboarding");
  }
  if (!isLoading && user && user?.memberships.length) {
    return (
      <div className="w-full flex flex-col items-stretch">
        <Navbar2 />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Welcome to your POS Dashboard
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Choose Your{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  Business
                </span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Select a vendor to manage your point of sale operations, or
                create a new business to get started.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* User Info Card */}
              <div className="lg:col-span-1">
                <div className="sticky top-6">
                  <UserInfo />
                </div>
              </div>

              {/* Vendor Selection */}
              <div className="lg:col-span-3">
                {/* Create New Vendor Card */}
                <div className="mb-8">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 hover:shadow-xl transition-all duration-300">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Plus className="w-10 h-10 text-white" />
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        Create New Business
                      </h3>

                      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        Start a new business venture and set up your point of
                        sale system from scratch.
                      </p>

                      <button
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        onClick={handleCreateVendor}
                      >
                        <Plus className="w-5 h-5" />
                        Create New Business
                      </button>
                    </div>
                  </div>
                </div>

                {/* Existing Vendors */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <Store className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Your Businesses
                    </h2>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full text-sm font-medium">
                      {user?.memberships?.length || 0}
                    </span>
                  </div>

                  {user?.memberships && user.memberships.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {user.memberships.map((membership) => (
                        <div
                          key={membership.id}
                          className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                          role="button"
                          tabIndex={0}
                          onClick={() =>
                            handleVendorSelect(membership.vendor.id)
                          }
                          onKeyDown={(e) => {}}
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {membership.vendor.name}
                              </h4>

                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                                {membership.vendor.description}
                              </p>

                              <div className="flex flex-wrap gap-2 mb-4">
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
                                  <Shield className="w-3 h-3" />
                                  {membership.role.name}
                                </span>
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200">
                                  <Store className="w-3 h-3" />
                                  {membership.vendor.subscription_tier}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                  <Users className="w-4 h-4" />
                                  <span>Active</span>
                                </div>

                                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium group-hover:gap-3 transition-all duration-300">
                                  <span className="text-sm">Open</span>
                                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Store className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        No Businesses Yet
                      </h3>

                      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        You have not joined any businesses yet. Create your
                        first business or ask an administrator to invite you.
                      </p>

                      <button
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        onClick={handleCreateVendor}
                      >
                        <Plus className="w-4 h-4" />
                        Create Your First Business
                      </button>
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

  return <UserLoding />;
}
