"use client";

import { useVendor } from "@/lib/contexts/VendorContext";
import { useAuth } from "@/lib/hooks/useAuth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function VendorNavbar() {
  const { vendor, currentRole, isLoading } = useVendor();
  const { logout } = useAuth();
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  if (isLoading || !vendor) {
    return (
      <nav className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 animate-pulse" />
    );
  }

  const isActive = (path: string) => pathname?.includes(path);

  return (
    <nav className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 flex items-center justify-between z-40 relative">
      <div className="flex items-center gap-8">
        <Link
          href={`/pos/vendor/${vendor.id}`}
          className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        >
          {vendor.name}
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link
            href={`/pos/vendor/${vendor.id}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === `/pos/vendor/${vendor.id}`
                ? "bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Dashboard
          </Link>
          {currentRole?.can_manage_roles_and_permissions && (
            <Link
              href={`/pos/vendor/${vendor.id}/roles`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/roles")
                  ? "bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              Roles
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Role Badge */}
        <div className="hidden md:flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 rounded-full">
          <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
            {currentRole?.name}
          </span>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </button>

          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-20 transform origin-top-right transition-all">
                <Link
                  href="/pos"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Switch Shop
                </Link>
                <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                <button
                  onClick={() => {
                    logout();
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
