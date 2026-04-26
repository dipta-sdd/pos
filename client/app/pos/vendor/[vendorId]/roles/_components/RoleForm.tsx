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
  "Financial & Analytics": [
    "can_manage_cash_drawer",
    "can_view_reports",
    "can_view_financial_analytics",
  ],
  "POS & Sales": [
    "can_use_pos",
    "can_manage_checkout_pricing",
    "can_manage_sales",
    "can_process_returns",
    "can_issue_cash_refunds",
    "can_issue_store_credit",
  ],
  Catalog: [
    "can_view_catalog",
    "can_manage_catalog",
    "can_delete_catalog",
  ],
  Operations: [
    "can_view_operations",
    "can_manage_operations",
    "can_delete_operations",
  ],
  "Access Control": [
    "can_view_access_control",
    "can_manage_access_control",
    "can_delete_access_control",
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
  // Financial & Analytics
  can_manage_cash_drawer: z.boolean().default(false),
  can_view_reports: z.boolean().default(false),
  can_view_financial_analytics: z.boolean().default(false),

  // POS & Sales
  can_use_pos: z.boolean().default(false),
  can_manage_checkout_pricing: z.boolean().default(false),
  can_manage_sales: z.boolean().default(false),
  can_process_returns: z.boolean().default(false),
  can_issue_cash_refunds: z.boolean().default(false),
  can_issue_store_credit: z.boolean().default(false),

  // Catalog
  can_view_catalog: z.boolean().default(true),
  can_manage_catalog: z.boolean().default(false),
  can_delete_catalog: z.boolean().default(false),

  // Operations & Procurement
  can_view_operations: z.boolean().default(false),
  can_manage_operations: z.boolean().default(false),
  can_delete_operations: z.boolean().default(false),

  // Access Control
  can_view_access_control: z.boolean().default(true),
  can_manage_access_control: z.boolean().default(false),
  can_delete_access_control: z.boolean().default(false),
});

export type RoleFormData = z.infer<typeof roleSchema>;

export const roleUpdateSchema = roleSchema.partial();

export type RoleUpdateFormData = z.infer<typeof roleUpdateSchema>;
();

export type RoleUpdateFormData = z.infer<typeof roleUpdateSchema>;
