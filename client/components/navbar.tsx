import NextLink from "next/link";
import { useState } from "react";
import { LogOut, Search, Settings, User } from "lucide-react";

import { ThemeSwitch } from "@/components/theme-switch";
import { useAuth } from "@/lib/hooks/useAuth";
import { Logo } from "@/components/icons";

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo and nav links */}
          <div className="flex items-center gap-6">
            <NextLink className="flex items-center gap-2" href="/">
              <Logo className="h-7 w-7" />
              <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
                POS System
              </span>
            </NextLink>
            {isAuthenticated && (
              <div className="hidden lg:flex gap-4 ml-4">
                <NextLink
                  className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 px-2 py-1 rounded transition-colors font-medium"
                  href="/pos"
                >
                  Dashboard
                </NextLink>
                <NextLink
                  className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 px-2 py-1 rounded transition-colors font-medium"
                  href="/pos/sales"
                >
                  Sales
                </NextLink>
                <NextLink
                  className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 px-2 py-1 rounded transition-colors font-medium"
                  href="/pos/inventory"
                >
                  Inventory
                </NextLink>
              </div>
            )}
          </div>

          {/* Center: Search - only show when authenticated */}
          {isAuthenticated && (
            <div className="hidden lg:flex flex-1 justify-center">
              <div className="relative w-72">
                <input
                  aria-label="Search"
                  className="w-full rounded-md bg-gray-100 dark:bg-gray-800 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition"
                  placeholder="Search products, customers..."
                  type="search"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <Search className="w-4 h-4" />
                </span>
                <span className="absolute right-3 top-2.5 hidden lg:inline-block text-xs text-gray-400 border rounded px-1 py-0.5">
                  ⌘K
                </span>
              </div>
            </div>
          )}

          {/* Right: User menu, theme, mobile menu */}
          <div className="flex items-center gap-2">
            {/* User Menu - only show when authenticated */}
            {isAuthenticated && user && (
              <div className="relative">
                <button
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
                    {user.firstName} {user.lastName}
                  </span>
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                    <NextLink
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      href="/pos/profile"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </NextLink>
                    <NextLink
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      href="/pos/settings"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </NextLink>
                    <button
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Auth Links - only show when not authenticated */}
            {!isAuthenticated && (
              <div className="hidden sm:flex items-center gap-2">
                <NextLink
                  className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded transition-colors font-medium"
                  href="/login"
                >
                  Sign in
                </NextLink>
                <NextLink
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                  href="/signup"
                >
                  Sign up
                </NextLink>
              </div>
            )}

            <ThemeSwitch />

            {/* Mobile menu button */}
            <button
              aria-label="Open menu"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 lg:hidden"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : (
                  <path
                    d="M4 8h16M4 16h16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-md">
          <div className="px-4 py-4 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                {/* User info */}
                <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 mb-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>

                {/* Navigation links */}
                <NextLink
                  className="block px-3 py-2 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition"
                  href="/pos"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </NextLink>
                <NextLink
                  className="block px-3 py-2 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition"
                  href="/pos/sales"
                  onClick={() => setMenuOpen(false)}
                >
                  Sales
                </NextLink>
                <NextLink
                  className="block px-3 py-2 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition"
                  href="/pos/inventory"
                  onClick={() => setMenuOpen(false)}
                >
                  Inventory
                </NextLink>

                {/* Search */}
                <div className="mt-3">
                  <div className="relative">
                    <input
                      aria-label="Search"
                      className="w-full rounded-md bg-gray-100 dark:bg-gray-800 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition"
                      placeholder="Search products, customers..."
                      type="search"
                    />
                    <span className="absolute left-3 top-2.5 text-gray-400">
                      <Search className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Logout */}
                <button
                  className="mt-3 w-full text-left px-3 py-2 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition"
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                {/* Auth links for non-authenticated users */}
                <NextLink
                  className="block px-3 py-2 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition"
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign in
                </NextLink>
                <NextLink
                  className="block px-3 py-2 rounded bg-primary-600 hover:bg-primary-700 text-white font-medium transition"
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign up
                </NextLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
