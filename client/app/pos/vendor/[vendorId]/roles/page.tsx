"use client";

import { useVendor } from "@/lib/contexts/VendorContext";
import Link from "next/link";

export default function RolesPage() {
  const { vendor, currentRole, isLoading } = useVendor();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Roles & Permissions
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage user roles and access levels
          </p>
        </div>
        {currentRole?.can_manage_roles_and_permissions && (
          <Link
            href={`/pos/vendor/${vendor?.id}/roles/new`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Role
          </Link>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-500">Role list will be implemented here.</p>
      </div>
    </div>
  );
}
