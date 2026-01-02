"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Role } from "@/lib/types/auth";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import { toast } from "sonner";
import { useState } from "react";

// 1. Zod Schema
const permissionSchema = z.boolean().default(false);

const roleFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Role name must be at least 2 characters." }),
  vendor_id: z.number().optional(),
  // Permissions
  // Dashboard & Reports
  can_view_dashboard: permissionSchema.optional(),
  can_view_reports: permissionSchema.optional(),
  can_view_profit_loss_data: permissionSchema.optional(),
  can_export_data: permissionSchema.optional(),
  can_view_user_activity_log: permissionSchema.optional(),
  // POS & Sales
  can_use_pos: permissionSchema.optional(),
  can_view_sales_history: permissionSchema.optional(),
  can_process_returns: permissionSchema.optional(),
  can_open_close_cash_register: permissionSchema.optional(),
  can_perform_cash_transactions: permissionSchema.optional(),
  can_override_prices: permissionSchema.optional(),
  can_apply_manual_discounts: permissionSchema.optional(),
  can_void_sales: permissionSchema.optional(),
  can_issue_cash_refunds: permissionSchema.optional(),
  can_issue_store_credit: permissionSchema.optional(),
  // Catalog & Inventory
  can_view_products: permissionSchema.optional(),
  can_manage_products: permissionSchema.optional(),
  can_manage_categories: permissionSchema.optional(),
  can_manage_units_of_measure: permissionSchema.optional(),
  can_import_products: permissionSchema.optional(),
  can_export_products: permissionSchema.optional(),
  can_view_inventory_levels: permissionSchema.optional(),
  can_perform_stock_adjustments: permissionSchema.optional(),
  can_manage_stock_transfers: permissionSchema.optional(),
  can_manage_purchase_orders: permissionSchema.optional(),
  can_receive_purchase_orders: permissionSchema.optional(),
  can_manage_suppliers: permissionSchema.optional(),
  // Customers & Promos
  can_view_customers: permissionSchema.optional(),
  can_manage_customers: permissionSchema.optional(),
  can_view_promotions: permissionSchema.optional(),
  can_manage_promotions: permissionSchema.optional(),
  // Settings & Admin
  can_manage_shop_settings: permissionSchema.optional(),
  can_manage_billing_and_plan: permissionSchema.optional(),
  can_manage_branches_and_counters: permissionSchema.optional(),
  can_manage_payment_methods: permissionSchema.optional(),
  can_configure_taxes: permissionSchema.optional(),
  can_customize_receipts: permissionSchema.optional(),
  can_manage_staff: permissionSchema.optional(),
  can_manage_roles_and_permissions: permissionSchema.optional(),
  can_view_roles: permissionSchema.optional(),
  can_manage_expenses: permissionSchema.optional(),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

interface RoleFormProps {
  initialData?: Partial<Role>;
  isEditing?: boolean;
  readOnly?: boolean;
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
    "can_view_roles",
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
  readOnly = false,
}: RoleFormProps) {
  const { vendor } = useVendor();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
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
    },
  });

  const onSubmit = async (data: RoleFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditing && initialData?.id) {
        await api.put(`/roles/${initialData.id}`, data);
        toast.success("Role updated successfully");
      } else {
        await api.post("/roles", data);
        toast.success("Role created successfully");
      }
      router.push(`/pos/vendor/${vendor?.id}/roles`);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || "Something went wrong";
      toast.error(message);

      // Handle backend validation errors
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((key) => {
          form.setError(key as any, {
            type: "server",
            message: errors[key][0],
          });
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleGroup = (groupPermissions: string[], value: boolean) => {
    groupPermissions.forEach((perm) => {
      form.setValue(perm as any, value, { shouldDirty: true });
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 w-full">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Role Name
        </label>
        <input
          {...form.register("name")}
          disabled={readOnly}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="e.g., Store Manager"
        />
        {form.formState.errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {Object.entries(PERMISSION_GROUPS).map(([groupName, permissions]) => {
          // Watch permissions for "Select All" state
          const groupValues = form.watch(permissions as any);
          const allChecked = groupValues.every((v: boolean) => v);

          return (
            <div
              key={groupName}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {groupName}
                </h3>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => toggleGroup(permissions, !allChecked)}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    {allChecked ? "Unselect All" : "Select All"}
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {permissions.map((perm) => (
                  <label
                    key={perm}
                    className={`flex items-start gap-3 group ${readOnly ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="relative flex items-center mt-0.5">
                      <input
                        type="checkbox"
                        {...form.register(perm as any)}
                        disabled={readOnly}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

      <div className="flex justify-end gap-4 py-4 w-full">
        {!readOnly && (
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
        )}
        {!readOnly && (
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : isEditing
                ? "Update Role"
                : "Create Role"}
          </button>
        )}
      </div>
    </form>
  );
}
