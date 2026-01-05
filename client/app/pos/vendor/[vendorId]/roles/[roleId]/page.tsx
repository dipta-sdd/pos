"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import RoleForm from "../_components/RoleForm";

import PermissionGuard from "@/components/auth/PermissionGuard";
import { useVendor } from "@/lib/contexts/VendorContext";
import api from "@/lib/api";
import { Role } from "@/lib/types/auth";

export default function EditRolePage() {
  const { currentRole, isLoading: contextLoading } = useVendor();
  const params = useParams();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if the user has permission to manage roles
  const canManageRoles = currentRole?.can_manage_roles_and_permissions || false;
  // If they can't manage, they are in read-only mode (since they passed the PermissionGuard which checks can_view_roles)
  const isReadOnly = !canManageRoles;

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await api.get(
          `/roles/${params.roleId}?vendor_id=${params.vendorId}`,
        );

        // @ts-ignore
        setRole(response.data);
      } catch (_error) {
        // console.error("Failed to fetch role:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.roleId) {
      fetchRole();
    }
  }, [params.roleId]);

  if (contextLoading || loading) return <div>Loading...</div>;
  if (!role) return <div>Role not found</div>;

  return (
    <PermissionGuard permission="can_view_roles">
      <div className="p-6 mx-auto w-full">
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isReadOnly ? "View Role" : "Edit Role"}: {role.name}
          </h1>
        </div>

        <RoleForm isEditing initialData={role} readOnly={isReadOnly} />
      </div>
    </PermissionGuard>
  );
}
