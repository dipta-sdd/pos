"use client";

import { Mail, Phone, User } from "lucide-react";

import { useAuth } from "@/lib/hooks/useAuth";

export function UserInfo() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="p-4 text-center text-gray-500">Not authenticated</div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">User Profile</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Mail className="w-4 h-4 text-gray-500" />
          <span className="text-gray-700 dark:text-gray-300">{user.email}</span>
        </div>

        {user.mobile && (
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">
              {user.mobile}
            </span>
          </div>
        )}

        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Member since {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
