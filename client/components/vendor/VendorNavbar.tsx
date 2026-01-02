import { useVendor } from "@/lib/contexts/VendorContext";
import { useAuth } from "@/lib/hooks/useAuth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { User } from "@heroui/user";
import { Menu } from "lucide-react";
import { useSidebar } from "@/lib/contexts/SidebarContext";

export default function VendorNavbar() {
  const { vendor, currentRole, isLoading } = useVendor();
  const { user, logout } = useAuth(); // Need 'user' for the avatar
  const pathname = usePathname();

  if (isLoading || !vendor) {
    return (
      <nav className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 animate-pulse" />
    );
  }

  const { toggleSidebar } = useSidebar();

  const isActive = (path: string) => pathname?.includes(path);

  return (
    <nav className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 flex items-center justify-between z-40 relative">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm">
            <Link
              href={`/pos/vendor/${vendor.id}`}
              className={`font-semibold transition-colors ${
                pathname === `/pos/vendor/${vendor.id}`
                  ? "text-gray-900 dark:text-gray-100"
                  : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              {vendor.name}
            </Link>

            {pathname
              ?.split("/")
              .filter(
                (segment) =>
                  segment &&
                  !["pos", "vendor", String(vendor.id)].includes(segment)
              )
              .map((segment, index, array) => {
                const isLast = index === array.length - 1;
                let label = segment;
                let href = "";

                // Map segments to readable labels
                if (segment === "roles") label = "Roles & Permissions";
                else if (segment === "new") label = "Create New";
                else if (!isNaN(Number(segment))) label = "Details"; // Fallback for IDs

                // Construct href
                if (segment === "roles")
                  href = `/pos/vendor/${vendor.id}/roles`;
                else if (segment === "new" && array[index - 1] === "roles")
                  href = `/pos/vendor/${vendor.id}/roles/new`;

                return (
                  <div key={segment} className="flex items-center gap-2">
                    <span className="text-gray-400 dark:text-gray-500">/</span>
                    {isLast || !href ? (
                      <span
                        className={`font-medium ${isLast ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}`}
                      >
                        {label}
                      </span>
                    ) : (
                      <Link
                        href={href}
                        className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                      >
                        {label}
                      </Link>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Switch */}
        <ThemeSwitch />

        {/* Profile Dropdown */}
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <User
              as="button"
              avatarProps={{
                isBordered: true,
                src: user?.avatar, // Assuming user object has avatar, else it falls back
              }}
              className="transition-transform"
              description={currentRole?.name}
              name={user?.firstName + " " + user?.lastName}
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="User Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-bold">Signed in as</p>
              <p className="font-bold">
                {user?.firstName + " " + user?.lastName}
              </p>
            </DropdownItem>
            <DropdownItem key="switch_shop" href="/pos">
              Switch Shop
            </DropdownItem>
            <DropdownItem key="settings">My Settings</DropdownItem>
            <DropdownItem key="help_and_feedback">Help & Feedback</DropdownItem>
            <DropdownItem key="logout" color="danger" onPress={logout}>
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </nav>
  );
}
