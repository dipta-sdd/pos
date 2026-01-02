"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  TabletSmartphone,
  ReceiptText,
  History,
  Undo2,
  Contact,
  BookMarked,
  Package,
  FolderTree,
  Boxes,
  Warehouse,
  Truck,
  Building2,
  FileIcon as FileWrench,
  GanttChartSquare,
  Wallet,
  Users,
  AreaChart,
  BookOpen,
  BarChart3,
  PieChart,
  FileDown,
  Settings,
  Briefcase,
  MapPin,
  ShieldCheck,
  CreditCard,
  Percent,
  Printer,
  Sparkles,
  PlugZap,
  ChevronDown,
  X,
} from "lucide-react";
import Link from "next/link";
import { useVendor } from "@/lib/contexts/VendorContext";
import { usePathname } from "next/navigation";
import { Role } from "@/lib/types/auth";

export type MenuItem = {
  icon: React.ElementType;
  label: string;
  href?: string;
  type?: "link" | "primary-link";
  subItems?: MenuItem[];
  permission?: keyof Role;
};

export default function Sidebar() {
  const { vendor, currentRole, isLoading } = useVendor();
  const [isOpen, setIsOpen] = useState(false); // Mobile off-canvas state
  const pathname = usePathname();

  if (isLoading || !vendor) return null;

  const closeMobileSidebar = () => {
    setIsOpen(false);
  };

  const menuItems: MenuItem[] = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: `/pos/vendor/${vendor.id}`,
      type: "link",
      permission: "can_view_dashboard",
    },
    {
      icon: TabletSmartphone,
      label: "Point of Sale (POS)",
      href: `/pos/vendor/${vendor.id}/pos`,
      type: "primary-link",
      permission: "can_use_pos",
    },
    {
      icon: ReceiptText,
      label: "Sales",
      permission: "can_view_sales_history",
      subItems: [
        {
          icon: History,
          label: "Sales History",
          href: `/pos/vendor/${vendor.id}/sales`,
          permission: "can_view_sales_history",
        },
        {
          icon: Undo2,
          label: "Returns",
          href: `/pos/vendor/${vendor.id}/returns`,
          permission: "can_process_returns",
        },
        {
          icon: Contact,
          label: "Customers",
          href: `/pos/vendor/${vendor.id}/customers`,
          permission: "can_view_customers",
        },
      ],
    },
    {
      icon: BookMarked,
      label: "Catalog",
      permission: "can_view_products",
      subItems: [
        {
          icon: Package,
          label: "Products",
          href: `/pos/vendor/${vendor.id}/products`,
          permission: "can_view_products",
        },
        {
          icon: FolderTree,
          label: "Categories",
          href: `/pos/vendor/${vendor.id}/products/categories`,
          permission: "can_manage_categories",
        },
      ],
    },
    {
      icon: Boxes,
      label: "Inventory",
      permission: "can_view_inventory_levels",
      subItems: [
        {
          icon: Warehouse,
          label: "Stock Levels",
          href: `/pos/vendor/${vendor.id}/inventory`,
          permission: "can_view_inventory_levels",
        },
        {
          icon: Truck,
          label: "Purchase Orders",
          href: `/pos/vendor/${vendor.id}/procurement/orders`,
          permission: "can_manage_purchase_orders",
        },
        {
          icon: Building2,
          label: "Suppliers",
          href: `/pos/vendor/${vendor.id}/procurement/suppliers`,
          permission: "can_manage_suppliers",
        },
        {
          icon: FileWrench,
          label: "Stock Adjustments",
          href: `/pos/vendor/${vendor.id}/inventory/adjustments`,
          permission: "can_perform_stock_adjustments",
        },
      ],
    },
    {
      icon: GanttChartSquare,
      label: "Operations",
      permission: "can_manage_expenses", // Simplification
      subItems: [
        {
          icon: Wallet,
          label: "Cash Management",
          href: `/pos/vendor/${vendor.id}/cash-management`,
          permission: "can_open_close_cash_register",
        },
        {
          icon: Users,
          label: "Staff",
          href: `/pos/vendor/${vendor.id}/settings/staff`,
          permission: "can_manage_staff",
        },
      ],
    },
    {
      icon: AreaChart,
      label: "Reports",
      permission: "can_view_reports",
      subItems: [
        {
          icon: BookOpen,
          label: "Financial Ledger",
          href: `/pos/vendor/${vendor.id}/reports/bills`,
          permission: "can_view_reports",
        },
        {
          icon: BarChart3,
          label: "Sales Reports",
          href: `/pos/vendor/${vendor.id}/reports/sales`,
          permission: "can_view_reports",
        },
        {
          icon: PieChart,
          label: "Inventory Reports",
          href: `/pos/vendor/${vendor.id}/reports/inventory`,
          permission: "can_view_reports",
        },
        {
          icon: FileDown,
          label: "Data Exports",
          href: `/pos/vendor/${vendor.id}/reports/exports`,
          permission: "can_export_data",
        },
      ],
    },
    {
      icon: Settings,
      label: "Settings",
      permission: "can_manage_shop_settings",
      subItems: [
        {
          icon: Briefcase,
          label: "Business Profile",
          href: `/pos/vendor/${vendor.id}/settings/profile`,
          permission: "can_manage_shop_settings",
        },
        {
          icon: MapPin,
          label: "Locations",
          href: `/pos/vendor/${vendor.id}/settings/branches`,
          permission: "can_manage_branches_and_counters",
        },
        {
          icon: ShieldCheck,
          label: "Roles & Permissions",
          href: `/pos/vendor/${vendor.id}/roles`,
          permission: "can_manage_roles_and_permissions",
        },
        {
          icon: CreditCard,
          label: "Payment Methods",
          href: `/pos/vendor/${vendor.id}/settings/payment-methods`,
          permission: "can_manage_payment_methods",
        },
        {
          icon: Percent,
          label: "Taxes",
          href: `/pos/vendor/${vendor.id}/settings/taxes`,
          permission: "can_configure_taxes",
        },
        {
          icon: Printer,
          label: "Receipts",
          href: `/pos/vendor/${vendor.id}/settings/receipts`,
          permission: "can_customize_receipts",
        },
        {
          icon: Sparkles,
          label: "Billing & Plan",
          href: `/pos/vendor/${vendor.id}/settings/billing`,
          permission: "can_manage_billing_and_plan",
        },
        {
          icon: PlugZap,
          label: "Integrations",
          href: `/pos/vendor/${vendor.id}/settings/integrations`,
          permission: "can_manage_shop_settings",
        },
      ],
    },
  ];

  // Filter items based on permissions
  const filteredItems = menuItems.filter((item) => {
    // Check main item permission
    if (item.permission && !(currentRole as any)?.[item.permission]) {
      return false;
    }

    // Filter subitems
    if (item.subItems) {
      item.subItems = item.subItems.filter((subItem) => {
        if (subItem.permission && !(currentRole as any)?.[subItem.permission]) {
          return false;
        }
        return true;
      });
      // If no subitems remain, hide the main item
      if (item.subItems.length === 0) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 z-40 md:hidden" />
      )}

      {/* Sidebar */}
      <div
        className={`
        sidebar-container
        fixed md:relative z-50 h-full bg-white dark:bg-gray-800 shadow-lg overflow-y-auto dark:shadow-gray-900/20 transition-all duration-300 ease-in-out 
        ${isOpen ? "translate-x-0 w-64 md:translate-x-0" : "-translate-x-full md:translate-x-0 w-14 hover:w-64"}
      `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 h-16">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-8 h-8 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap transition-all duration-300">
              POS System
            </span>
          </div>

          {/* Mobile close button */}
          {isOpen && (
            <button
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
              onClick={closeMobileSidebar}
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-0 space-y-2 pt-2 overflow-y-auto overflow-x-hidden">
          {filteredItems.map((item, index) => (
            <SidebarOption key={index} activeItem={pathname} item={item} />
          ))}
        </nav>
      </div>
    </div>
  );
}

export function SidebarOption({
  item,
  activeItem,
}: {
  item: MenuItem;
  activeItem: string | null;
}) {
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const isDropDown = item.subItems && item.subItems.length > 0;

  // Check if any subitem is active
  const isSubItemActive = item.subItems?.some((sub) => activeItem === sub.href);

  // Auto open dropdown if active
  if (isSubItemActive && !isDropDownOpen) {
    setIsDropDownOpen(true);
  }

  return (
    <div className="relative cursor-pointer group">
      <div className="absolute top-0 left-0 p-0 px-2 w-full -z-1">
        <span
          className={`h-10 w-full block rounded-sm ${
            activeItem === item.href || isSubItemActive
              ? isDropDown
                ? "bg-blue-50 dark:bg-blue-900/20"
                : "bg-blue-100 dark:bg-blue-900/40"
              : ""
          } group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20`}
        >
          &nbsp;
        </span>
      </div>

      <Link
        href={!isDropDown ? item.href || "#" : "#"}
        className="block"
        onClick={(e) => {
          if (isDropDown) {
            e.preventDefault();
            setIsDropDownOpen(!isDropDownOpen);
          }
        }}
      >
        <div className="flex items-center gap-4 w-64 p-2 px-4">
          <item.icon
            className={`w-6 h-6 m-0 flex-shrink-0 ${activeItem === item.href || isSubItemActive ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}
          />
          <span
            className={`flex-1 flex flex-row flex-nowrap justify-between items-center ${activeItem === item.href || isSubItemActive ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-800 dark:text-gray-200"}`}
          >
            <span>{item.label}</span>
            {isDropDown && (
              <ChevronDown
                className={`w-4 h-4 text-gray-400 ${isDropDownOpen ? "rotate-180" : ""}`}
              />
            )}
          </span>
        </div>
      </Link>

      {isDropDown && (
        <div
          className={`sidebar-dropdown-menu ${isDropDownOpen ? "sidebar-dropdown-menu-open h-auto opacity-100" : "h-0 opacity-0"} overflow-hidden transition-all duration-300 ease-in-out`}
        >
          <div className="m-1 ml-6 space-y-1 py-1 border-l-2 border-gray-100 dark:border-gray-700 pl-2">
            {item.subItems?.map((subItem: MenuItem, subIndex: number) => (
              <Link
                key={subIndex}
                className={`
                      flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors duration-200
                      ${
                        activeItem === subItem.href
                          ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 font-medium"
                          : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      }
                    `}
                href={subItem.href || ""}
              >
                <subItem.icon className="w-4 h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">{subItem.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
