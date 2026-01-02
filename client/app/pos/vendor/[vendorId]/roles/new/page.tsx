"use client";

import PermissionGuard from "@/components/auth/PermissionGuard";
import { useVendor } from "@/lib/contexts/VendorContext";
import { useRouter } from "next/navigation";
import RoleForm from "../_components/RoleForm";

export default function NewRolePage() {
  const { isLoading } = useVendor();
  const router = useRouter();

  if (isLoading) return <div>Loading...</div>;

  return (
    <PermissionGuard permission="can_manage_roles_and_permissions">
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
