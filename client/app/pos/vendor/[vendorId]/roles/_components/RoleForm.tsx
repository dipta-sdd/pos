"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Input,
  Button,
  Checkbox,
  Card,
  CardHeader,
  CardBody,
  Divider,
} from "@heroui/react";

import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import { Role } from "@/lib/types/auth";

interface RoleFormProps {
  initialData?: Role;
  isEditing?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
  readOnly?: boolean;
  canDeleteRoles?: boolean;
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
    "can_request_cash_transactions",
    "can_approve_cash_transactions",
    "can_override_prices",
    "can_apply_manual_discounts",
    "can_void_sales",
    "can_issue_cash_refunds",
    "can_issue_store_credit",
  ],
  "Products & Catalog": [
    "can_view_products",
    "can_edit_products",
    "can_delete_products",
    "can_import_products",
    "can_export_products",
  ],
  Categories: [
    "can_view_categories",
    "can_edit_categories",
    "can_delete_categories",
  ],
  "Units of Measure": [
    "can_view_units_of_measure",
    "can_edit_units_of_measure",
    "can_delete_units_of_measure",
  ],
  Inventory: [
    "can_view_inventory_levels",
    "can_perform_stock_adjustments",
    "can_view_stock_transfers",
    "can_edit_stock_transfers",
    "can_delete_stock_transfers",
    "can_view_purchase_orders",
    "can_edit_purchase_orders",
    "can_delete_purchase_orders",
    "can_view_suppliers",
    "can_edit_suppliers",
    "can_delete_suppliers",
  ],
  "Customers & Promos": [
    "can_view_customers",
    "can_manage_customers",
    "can_view_promotions",
    "can_manage_promotions",
  ],
  "Branches & Counters": [
    "can_view_branches",
    "can_edit_branches",
    "can_delete_branches",
    "can_view_counters",
    "can_edit_counters",
    "can_delete_counters",
  ],
  "Payment & Expenses": [
    "can_view_payment_methods",
    "can_edit_payment_methods",
    "can_delete_payment_methods",
    "can_view_expenses",
    "can_edit_expenses",
    "can_delete_expenses",
  ],
  "Users & Roles": [
    "can_view_users",
    "can_edit_users",
    "can_delete_users",
    "can_view_roles",
    "can_edit_roles",
    "can_delete_roles",
  ],
  "Shop Settings": [
    "can_manage_shop_settings",
    "can_manage_billing_and_plan",
    "can_configure_taxes",
    "can_customize_receipts",
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
  onSuccess,
  onCancel,
  readOnly = false,
  canDeleteRoles = false,
}: RoleFormProps) {
  const { vendor } = useVendor();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<RoleFormData>({
    // @ts-ignore
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: initialData?.name || "",
      vendor_id: vendor?.id,
      ...Object.keys(PERMISSION_GROUPS).reduce((acc, group) => {
        PERMISSION_GROUPS[group as keyof typeof PERMISSION_GROUPS].forEach(
          (perm) => {
            // @ts-ignore
            acc[perm] = initialData?.[perm] || false;
          },
        );

        return acc;
      }, {} as any),
    },
  });

  const toggleGroup = (groupPermissions: string[], value: boolean) => {
    groupPermissions.forEach((perm) => {
      setValue(perm as any, value, { shouldDirty: true });
    });
  };

  const onSubmit = async (data: RoleFormData) => {
    try {
      if (isEditing && initialData?.id) {
        await api.put(`/roles/${initialData.id}`, data);
        toast.success("Role updated successfully");
      } else {
        await api.post("/roles", data);
        toast.success("Role created successfully");
      }

      if (onSuccess) {
        onSuccess();
        router.push(`/pos/vendor/${vendor?.id}/roles`);
      } else {
        router.push(`/pos/vendor/${vendor?.id}/roles`);
      }
    } catch (error: any) {}
  };

  return (
    // @ts-ignore
    <form className="space-y-6 w-full" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6">
        <Input
          isRequired
          id="role-name"
          label="Role Name"
          placeholder="e.g., Store Manager"
          variant="bordered"
          {...register("name")}
          errorMessage={errors.name?.message}
          isDisabled={readOnly}
          isInvalid={!!errors.name}
          isReadOnly={readOnly}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(PERMISSION_GROUPS).map(([groupName, permissions]) => {
            const groupValues = watch(permissions as any);
            const allChecked = groupValues?.every((v: boolean) => v) ?? false;

            return (
              <Card
                key={groupName}
                className="shadow-sm border border-default-200"
              >
                <CardHeader className="flex justify-between items-center px-4 py-3 bg-default-50">
                  <span className="font-semibold text-small">{groupName}</span>
                  {!readOnly && (
                    <Button
                      className="h-auto min-w-0 px-2 py-1 text-tiny"
                      color="primary"
                      size="sm"
                      variant="light"
                      onPress={() => toggleGroup(permissions, !allChecked)}
                    >
                      {allChecked ? "Unselect All" : "Select All"}
                    </Button>
                  )}
                </CardHeader>
                <Divider />
                <CardBody className="gap-3 px-4 py-3">
                  {permissions.map((perm) => (
                    <Checkbox
                      key={perm}
                      classNames={{ label: "text-small" }}
                      isDisabled={readOnly}
                      isSelected={watch(perm as any)}
                      onValueChange={(value) =>
                        setValue(perm as any, value, { shouldDirty: true })
                      }
                    >
                      {formatPermissionLabel(perm)}
                    </Checkbox>
                  ))}
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {/* {!readOnly && (
          <Button color="default" variant="flat" onPress={onCancel}>
            Cancel
          </Button>
        )} */}
        {!readOnly && (
          <Button color="primary" isLoading={isSubmitting} type="submit">
            {isEditing ? "Update Role" : "Create Role"}
          </Button>
        )}
        {readOnly && (
          <Button
            color="default"
            variant="flat"
            onPress={onCancel || (() => router.back())}
          >
            Go Back
          </Button>
        )}
      </div>
    </form>
  );
}

// Role validation schema
export const roleSchema = z.object({
  vendor_id: z.number().optional(),
  name: z
    .string()
    .min(1, "Role name is required")
    .min(2, "Role name must be at least 2 characters")
    .max(100, "Role name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_&.]+$/, "Role name contains invalid characters"),

  // Permissions
  // Dashboard & Reports
  can_view_dashboard: z.boolean().default(false),
  can_view_reports: z.boolean().default(false),
  can_view_profit_loss_data: z.boolean().default(false),
  can_export_data: z.boolean().default(false),
  can_view_user_activity_log: z.boolean().default(false),

  // POS & Sales
  can_use_pos: z.boolean().default(false),
  can_view_sales_history: z.boolean().default(false),
  can_process_returns: z.boolean().default(false),
  can_open_close_cash_register: z.boolean().default(false),
  can_request_cash_transactions: z.boolean().default(false),
  can_approve_cash_transactions: z.boolean().default(false),
  can_override_prices: z.boolean().default(false),
  can_apply_manual_discounts: z.boolean().default(false),
  can_void_sales: z.boolean().default(false),
  can_issue_cash_refunds: z.boolean().default(false),
  can_issue_store_credit: z.boolean().default(false),

  // Products & Catalog
  can_view_products: z.boolean().default(true),
  can_edit_products: z.boolean().default(false),
  can_delete_products: z.boolean().default(false),
  can_import_products: z.boolean().default(false),
  can_export_products: z.boolean().default(false),

  // Categories
  can_view_categories: z.boolean().default(true),
  can_edit_categories: z.boolean().default(false),
  can_delete_categories: z.boolean().default(false),

  // Units of Measure
  can_view_units_of_measure: z.boolean().default(true),
  can_edit_units_of_measure: z.boolean().default(false),
  can_delete_units_of_measure: z.boolean().default(false),

  // Inventory
  can_view_inventory_levels: z.boolean().default(false),
  can_perform_stock_adjustments: z.boolean().default(false),
  can_view_stock_transfers: z.boolean().default(false),
  can_edit_stock_transfers: z.boolean().default(false),
  can_delete_stock_transfers: z.boolean().default(false),
  can_view_purchase_orders: z.boolean().default(false),
  can_edit_purchase_orders: z.boolean().default(false),
  can_delete_purchase_orders: z.boolean().default(false),
  can_view_suppliers: z.boolean().default(false),
  can_edit_suppliers: z.boolean().default(false),
  can_delete_suppliers: z.boolean().default(false),

  // Customers & Promos
  can_view_customers: z.boolean().default(false),
  can_manage_customers: z.boolean().default(false),
  can_view_promotions: z.boolean().default(false),
  can_manage_promotions: z.boolean().default(false),

  // Branches & Counters
  can_view_branches: z.boolean().default(true),
  can_edit_branches: z.boolean().default(false),
  can_delete_branches: z.boolean().default(false),
  can_view_counters: z.boolean().default(true),
  can_edit_counters: z.boolean().default(false),
  can_delete_counters: z.boolean().default(false),

  // Payment & Expenses
  can_view_payment_methods: z.boolean().default(true),
  can_edit_payment_methods: z.boolean().default(false),
  can_delete_payment_methods: z.boolean().default(false),
  can_view_expenses: z.boolean().default(false),
  can_edit_expenses: z.boolean().default(false),
  can_delete_expenses: z.boolean().default(false),

  // Users & Roles
  can_view_users: z.boolean().default(true),
  can_edit_users: z.boolean().default(false),
  can_delete_users: z.boolean().default(false),
  can_view_roles: z.boolean().default(true),
  can_edit_roles: z.boolean().default(false),
  can_delete_roles: z.boolean().default(false),

  // Shop Settings
  can_manage_shop_settings: z.boolean().default(false),
  can_manage_billing_and_plan: z.boolean().default(false),
  can_configure_taxes: z.boolean().default(false),
  can_customize_receipts: z.boolean().default(false),
});

export type RoleFormData = z.infer<typeof roleSchema>;

export const roleUpdateSchema = roleSchema.partial();

export type RoleUpdateFormData = z.infer<typeof roleUpdateSchema>;
