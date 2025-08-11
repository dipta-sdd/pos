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

export type MenuItem = {
  icon: React.ElementType;
  label: string;
  href?: string;
  type?: "link" | "primary-link";
  subItems?: MenuItem[];
};

const menuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/app/dashboard",
    type: "link",
  },
  {
    icon: TabletSmartphone,
    label: "Point of Sale (POS)",
    href: "/app/pos",
    type: "primary-link",
  },
  {
    icon: ReceiptText,
    label: "Sales",
    subItems: [
      { icon: History, label: "Sales History", href: "/app/sales" },
      { icon: Undo2, label: "Returns", href: "/app/returns" },
      { icon: Contact, label: "Customers", href: "/app/customers" },
    ],
  },
  {
    icon: BookMarked,
    label: "Catalog",
    href: "/app/products",
    subItems: [
      { icon: Package, label: "Products", href: "/app/products" },
      {
        icon: FolderTree,
        label: "Categories",
        href: "/app/products/categories",
      },
    ],
  },
  {
    icon: Boxes,
    label: "Inventory",
    subItems: [
      { icon: Warehouse, label: "Stock Levels", href: "/app/inventory" },
      {
        icon: Truck,
        label: "Purchase Orders",
        href: "/app/procurement/orders",
      },
      {
        icon: Building2,
        label: "Suppliers",
        href: "/app/procurement/suppliers",
      },
      {
        icon: FileWrench,
        label: "Stock Adjustments",
        href: "/app/inventory/adjustments",
      },
    ],
  },
  {
    icon: GanttChartSquare,
    label: "Operations",
    subItems: [
      {
        icon: Wallet,
        label: "Cash Management",
        href: "/app/cash-management",
      },
      { icon: Users, label: "Staff", href: "/app/settings/staff" },
    ],
  },
  {
    icon: AreaChart,
    label: "Reports",
    subItems: [
      {
        icon: BookOpen,
        label: "Financial Ledger",
        href: "/app/reports/bills",
      },
      {
        icon: BarChart3,
        label: "Sales Reports",
        href: "/app/reports/sales",
      },
      {
        icon: PieChart,
        label: "Inventory Reports",
        href: "/app/reports/inventory",
      },
      {
        icon: FileDown,
        label: "Data Exports",
        href: "/app/reports/exports",
      },
    ],
  },
  {
    icon: Settings,
    label: "Settings",
    subItems: [
      {
        icon: Briefcase,
        label: "Business Profile",
        href: "/app/settings/profile",
      },
      { icon: MapPin, label: "Locations", href: "/app/settings/branches" },
      {
        icon: ShieldCheck,
        label: "Roles & Permissions",
        href: "/app/settings/roles",
      },
      {
        icon: CreditCard,
        label: "Payment Methods",
        href: "/app/settings/payment-methods",
      },
      { icon: Percent, label: "Taxes", href: "/app/settings/taxes" },
      { icon: Printer, label: "Receipts", href: "/app/settings/receipts" },
      {
        icon: Sparkles,
        label: "Billing & Plan",
        href: "/app/settings/billing",
      },
      {
        icon: PlugZap,
        label: "Integrations",
        href: "/app/settings/integrations",
      },
    ],
  },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false); // Mobile off-canvas state
  const [activeItem] = useState<string | null>("/app/products");

  const closeMobileSidebar = () => {
    setIsOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
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
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span
              className="font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap transition-all duration-300"
            >
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
          {menuItems.map((item, index) => (
            <SidebarOption key={index} activeItem={activeItem} item={item} />
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

  return (
    <div className="relative cursor-pointer group">
      <div className="absolute top-0 left-0 p-0 px-2 w-full -z-1">
        <span
          className={`h-10 w-full block rounded-sm ${
            activeItem === item.href
              ? isDropDown
                ? "bg-blue-200 dark:bg-blue-700 opacity-10"
                : "bg-blue-200 dark:bg-blue-700"
              : ""
          }  group-hover:bg-blue-200 dark:group-hover:bg-blue-700 group-hover:opacity-10`}
        >
          &nbsp;
        </span>
      </div>

      <div className="flex items-center gap-4 w-64 p-2 px-4">
        <item.icon className="w-6 h-6 m-0 flex-shrink-0 text-gray-600 dark:text-gray-400 " />
        <span className="text-gray-800 dark:text-gray-200 flex-1 flex flex-row flex-nowrap justify-between items-center">
          <span>{item.label}</span>
          {isDropDown && (
            <ChevronDown
              className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${isDropDownOpen ? "rotate-180" : "group-hover:rotate-180"}`}
              onClick={() => setIsDropDownOpen(!isDropDownOpen)}
            />
          )}
        </span>
      </div>

      <div
        className={`h-0 sidebar-dropdown-menu ${isDropDownOpen ? "sidebar-dropdown-menu-open" : ""} overflow-hidden transition-all duration-300 ease-in-out`}
      >
        <div className="m-1 ml-6 space-y-1">
          {item.subItems?.map((subItem: MenuItem, subIndex: number) => (
            <Link
              key={subIndex}
              className={`
                    flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors duration-200
                  `}
              href={subItem.href || ""}
            >
              <subItem.icon className="w-4 h-4 flex-shrink-0" />
              <span
                className={`whitespace-nowrap transition-all duration-300 $`}
              >
                {subItem.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
