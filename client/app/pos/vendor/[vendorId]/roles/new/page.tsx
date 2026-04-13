"use client";

import RoleForm from "../_components/RoleForm";

import PermissionGuard from "@/components/auth/PermissionGuard";
import { UserLoding } from "@/components/user-loding";
import { useVendor } from "@/lib/contexts/VendorContext";

export default function NewRolePage() {
  const { isLoading: contextLoading } = useVendor();

  if (contextLoading) return <UserLoding />;

  return (
    <PermissionGuard permission="can_view_roles">
      <div className="p-6 mx-auto w-full">
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Role
          </h1>
        </div>

        <RoleForm />
      </div>
    </PermissionGuard>
  );
}
