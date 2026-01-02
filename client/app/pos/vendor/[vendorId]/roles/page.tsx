"use client";

import PermissionGuard from "@/components/auth/PermissionGuard";
import { useVendor } from "@/lib/contexts/VendorContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Role } from "@/lib/types/auth";
import Pagination from "@/components/ui/Pagination";
import { Edit, Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RolesPage() {
  const { vendor, currentRole, isLoading: contextLoading } = useVendor();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const router = useRouter();

  useEffect(() => {
    if (vendor?.id) {
      fetchRoles(1);
    }
  }, [vendor?.id, perPage]);

  const fetchRoles = async (page: number) => {
    setLoading(true);
    try {
      const response = await api.get(
        `/roles?page=${page}&per_page=${perPage}&vendor_id=${vendor?.id}`
      );
      // @ts-ignore
      setRoles(response?.data?.data);
      // @ts-ignore
      setCurrentPage(response?.data?.current_page);
      // @ts-ignore
      setLastPage(response?.data?.last_page);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roleId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this role? This action cannot be undone."
      )
    )
      return;

    try {
      await api.delete(`/roles/${roleId}?vendor_id=${vendor?.id}`);
      toast.success("Role deleted successfully");
      fetchRoles(currentPage);
    } catch (error) {
      console.error("Failed to delete role:", error);
      toast.error("Failed to delete role");
    }
  };

  if (contextLoading) return <div>Loading...</div>;

  return (
    <PermissionGuard permission="can_view_roles">
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

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading roles...
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4">Role Name</th>
                      <th className="px-6 py-4">Created At</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {roles.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          No roles found. Create one to get started.
                        </td>
                      </tr>
                    ) : (
                      roles.map((role) => (
                        <tr
                          key={role.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-900 dark:text-gray-200">
                              {role.name}
                            </span>
                            {role.name === "Owner" && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full dark:bg-amber-900/30 dark:text-amber-300">
                                System
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                            {new Date(role.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {role.name !== "Owner" && (
                                <>
                                  <button
                                    onClick={() =>
                                      router.push(
                                        `/pos/vendor/${vendor?.id}/roles/${role.id}`
                                      )
                                    }
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg dark:text-blue-400 dark:hover:bg-blue-900/20"
                                    title={
                                      currentRole?.can_manage_roles_and_permissions
                                        ? "Edit Role"
                                        : "View Role"
                                    }
                                  >
                                    {currentRole?.can_manage_roles_and_permissions ? (
                                      <Edit className="w-4 h-4" />
                                    ) : (
                                      <Eye className="w-4 h-4" />
                                    )}
                                  </button>
                                  {currentRole?.can_manage_roles_and_permissions && (
                                    <button
                                      onClick={() => handleDelete(role.id)}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg dark:text-red-400 dark:hover:bg-red-900/20"
                                      title="Delete Role"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={currentPage}
                lastPage={lastPage}
                onPageChange={fetchRoles}
                perPage={perPage}
                onPerPageChange={setPerPage}
              />
            </>
          )}
        </div>
      </div>
    </PermissionGuard>
  );
}
