"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import UserForm from "../_components/UserForm";

import PermissionGuard from "@/components/auth/PermissionGuard";
import { useVendor } from "@/lib/contexts/VendorContext";
import api from "@/lib/api";

export default function EditUserPage() {
  const { vendor, isLoading: contextLoading } = useVendor();
  const params = useParams();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vendor?.id && params.userId) {
      fetchUser();
    }
  }, [vendor?.id, params.userId]);

  const fetchUser = async () => {
    try {
      const response = await api.get(
        `/users/${params.userId}?vendor_id=${vendor?.id}`
      );
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      setLoading(false);
    }
  };

  if (contextLoading || loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <PermissionGuard permission="can_manage_staff">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit User
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Update user details and permissions
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <UserForm initialData={user} isEditing />
        </div>
      </div>
    </PermissionGuard>
  );
}
