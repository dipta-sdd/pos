"use client";

import { useState } from "react";
import { Role } from "@/lib/types/auth";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";

interface RoleFormProps {
  initialData?: Partial<Role>;
  isEditing?: boolean;
}

const PERMISSION_GROUPS = {
  "Dashboard & Reports": [
    "can_view_dashboard",
    "can_view_reports",
    "can_view_profit_loss_data",
    "can_export_data",
    "can_view_user_activity_log",
  ],
  "POS & Sales": [
    "can_use_pos",
    "can_view_sales_history",
    "can_process_returns",
    "can_open_close_cash_register",
    "can_perform_cash_transactions",
    "can_override_prices",
    "can_apply_manual_discounts",
    "can_void_sales",
    "can_issue_cash_refunds",
    "can_issue_store_credit",
  ],
  "Catalog & Inventory": [
    "can_view_products",
    "can_manage_products",
    "can_manage_categories",
    "can_manage_units_of_measure",
    "can_import_products",
    "can_export_products",
    "can_view_inventory_levels",
    "can_perform_stock_adjustments",
    "can_manage_stock_transfers",
    "can_manage_purchase_orders",
    "can_receive_purchase_orders",
    "can_manage_suppliers",
  ],
  "Customers & Promos": [
    "can_view_customers",
    "can_manage_customers",
    "can_view_promotions",
    "can_manage_promotions",
  ],
  "Settings & Admin": [
    "can_manage_shop_settings",
    "can_manage_billing_and_plan",
    "can_manage_branches_and_counters",
    "can_manage_payment_methods",
    "can_configure_taxes",
    "can_customize_receipts",
    "can_manage_staff",
    "can_manage_roles_and_permissions",
    "can_manage_expenses",
  ],
};

const formatPermissionLabel = (key: string) => {
  return key
    .replace(/^can_/, "")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function RoleForm({
  initialData,
  isEditing = false,
}: RoleFormProps) {
  const { vendor } = useVendor();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Role>>({
    name: initialData?.name || "",
    vendor_id: vendor?.id,
    ...Object.keys(PERMISSION_GROUPS).reduce((acc, group) => {
      PERMISSION_GROUPS[group as keyof typeof PERMISSION_GROUPS].forEach(
        (perm) => {
          // @ts-ignore
          acc[perm] = initialData?.[perm] || false;
        }
      );
      return acc;
    }, {} as any),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setLoading(true);
    setError(null);

    try {
      if (isEditing && initialData?.id) {
        await api.put(`/roles/${initialData.id}`, formData);
      } else {
        await api.post("/roles", formData);
      }
      router.push(`/pos/vendor/${vendor?.id}/roles`);
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save role");
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (key: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: !prev[key as keyof Role],
    }));
  };

  const toggleGroup = (groupPermissions: string[], value: boolean) => {
    setFormData((prev) => {
      const updates: any = {};
      groupPermissions.forEach((perm) => {
        updates[perm] = value;
      });
      return { ...prev, ...updates };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Role Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white"
          placeholder="e.g., Store Manager"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(PERMISSION_GROUPS).map(([groupName, permissions]) => {
          const allChecked = permissions.every(
            (p) => formData[p as keyof Role]
          );

          return (
            <div
              key={groupName}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {groupName}
                </h3>
                <button
                  type="button"
                  onClick={() => toggleGroup(permissions, !allChecked)}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  {allChecked ? "Unselect All" : "Select All"}
                </button>
              </div>

              <div className="space-y-3">
                {permissions.map((perm) => (
                  <label
                    key={perm}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <div className="relative flex items-center mt-0.5">
                      <input
                        type="checkbox"
                        checked={!!formData[perm as keyof Role]}
                        onChange={() => togglePermission(perm)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700"
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                      {formatPermissionLabel(perm)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-4 py-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : isEditing ? "Update Role" : "Create Role"}
        </button>
      </div>
    </form>
  );
}
