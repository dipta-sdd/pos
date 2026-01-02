"use client";

import PermissionGuard from "@/components/auth/PermissionGuard";
import { useVendor } from "@/lib/contexts/VendorContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Role } from "@/lib/types/auth";
import RoleForm from "../_components/RoleForm";

export default function EditRolePage() {
  const { isLoading: contextLoading } = useVendor();
  const router = useRouter();
  const params = useParams();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await api.get(`/roles/${params.roleId}`);
        // @ts-ignore
        setRole(response.data);
      } catch (error) {
        console.error("Failed to fetch role:", error);
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
    <PermissionGuard permission="can_manage_roles_and_permissions">
      <div className="p-6 mx-auto w-full">
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Role: {role.name}
          </h1>
        </div>

        <RoleForm initialData={role} isEditing />
      </div>
    </PermissionGuard>
  );
}
