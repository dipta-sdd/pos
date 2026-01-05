"use client";

import UserForm from "../_components/UserForm";
import PermissionGuard from "@/components/auth/PermissionGuard";

export default function NewUserPage() {
  return (
    <PermissionGuard permission="can_manage_staff">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add New User
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Create a new user account and assign them a role
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <UserForm />
        </div>
      </div>
    </PermissionGuard>
  );
}
