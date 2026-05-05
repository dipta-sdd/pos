"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Input, Textarea } from "@heroui/react";
import { Building2, Globe } from "lucide-react";

import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import api from "@/lib/api";
import { UserLoding } from "@/components/user-loding";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  currency: z.string().min(1, "Currency is required"),
  timezone: z.string().min(1, "Timezone is required"),
  language: z.string().default("en"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function BusinessProfilePage() {
  const { vendor, isLoading: contextLoading, refreshVendor } = useVendor();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (vendor) {
      reset({
        name: vendor.name,
        description: vendor.description || "",
        phone: vendor.phone || "",
        address: vendor.address || "",
        currency: vendor.currency,
        timezone: vendor.timezone,
        language: vendor.language || "en",
      });
    }
  }, [vendor, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await api.put(`/vendors/${vendor?.id}`, data);
      toast.success("Business profile updated successfully");
      refreshVendor();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  if (contextLoading) return <UserLoding />;
  if (!vendor) return null;

  return (
    <PermissionGuard permission="can_edit_organization_settings">
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <PageHeader
            description="Manage your shop details and localization settings"
            title="Business Profile"
          >
            <Button color="primary" isLoading={isSubmitting} type="submit">
              Save Changes
            </Button>
          </PageHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardBody className="p-6 space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  General Information
                </h3>
                <div className="space-y-4">
                  <Input
                    isRequired
                    label="Business Name"
                    variant="bordered"
                    {...register("name")}
                    errorMessage={errors.name?.message}
                    isInvalid={!!errors.name}
                  />
                  <Textarea
                    label="Description"
                    variant="bordered"
                    {...register("description")}
                  />
                  <Input
                    label="Phone"
                    variant="bordered"
                    {...register("phone")}
                  />
                  <Textarea
                    label="Address"
                    variant="bordered"
                    {...register("address")}
                  />
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-6 space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Localization
                </h3>
                <div className="space-y-4">
                  <Input
                    isRequired
                    label="Currency (e.g. USD, BDT)"
                    variant="bordered"
                    {...register("currency")}
                  />
                  <Input
                    isRequired
                    label="Timezone (e.g. Asia/Dhaka)"
                    variant="bordered"
                    {...register("timezone")}
                  />
                  <div className="pt-4 border-t border-default-100">
                    <p className="text-xs text-default-400">
                      Subscription Tier:{" "}
                      <span className="font-bold text-primary uppercase">
                        {vendor.subscription_tier}
                      </span>
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </form>
      </div>
    </PermissionGuard>
  );
}
