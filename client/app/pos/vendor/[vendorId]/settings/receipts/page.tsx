"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Printer } from "lucide-react";
import { Switch } from "@heroui/react";

import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import api from "@/lib/api";
import { UserLoding } from "@/components/user-loding";

export default function ReceiptSettingsPage() {
  const { vendor, isLoading: contextLoading } = useVendor();
  const [loading, setLoading] = useState<boolean>(true);

  const schema = z.object({
    header_text: z.string().optional(),
    footer_text: z.string().optional(),
    show_logo: z.boolean(),
    show_address: z.boolean(),
    show_contact_info: z.boolean(),
    vendor_id: z.number(),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      show_logo: false,
      show_address: true,
      show_contact_info: true,
      vendor_id: vendor?.id,
    },
  });

  useEffect(() => {
    if (vendor?.id) {
      fetchSettings();
    }
  }, [vendor?.id]);

  const fetchSettings = async () => {
    try {
      const response: any = await api.get(`/receipt-settings/${vendor?.id}`);

      if (response?.data) {
        reset({
          ...response.data,
          show_logo: Boolean(response.data.show_logo),
          show_address: Boolean(response.data.show_address),
          show_contact_info: Boolean(response.data.show_contact_info),
          vendor_id: vendor?.id,
        });
      }
    } catch (error) {
      console.error("Failed to fetch receipt settings", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      await api.put(`/receipt-settings/${vendor?.id}`, data);
      toast.success("Receipt settings updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update settings");
    }
  };

  if (contextLoading || loading) return <UserLoding />;

  return (
    <PermissionGuard permission="can_customize_receipts">
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <PageHeader
            description="Customize your sales receipts"
            title="Receipt Settings"
          >
            <Button color="primary" isLoading={isSubmitting} type="submit">
              Save Settings
            </Button>
          </PageHeader>

          <div className="max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardBody className="p-6 space-y-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Printer className="w-5 h-5 text-primary" />
                    Receipt Customization
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label
                        className="text-sm font-medium"
                        htmlFor="header_text"
                      >
                        Header Text
                      </label>
                      <textarea
                        className="w-full p-3 border-2 rounded-lg min-h-[100px] focus:border-primary outline-none transition-colors"
                        id="header_text"
                        placeholder="e.g. Thank you for shopping with us!"
                        {...register("header_text")}
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        className="text-sm font-medium"
                        htmlFor="footer_text"
                      >
                        Footer Text
                      </label>
                      <textarea
                        className="w-full p-3 border-2 rounded-lg min-h-[100px] focus:border-primary outline-none transition-colors"
                        id="footer_text"
                        placeholder="e.g. Please keep your receipt for returns."
                        {...register("footer_text")}
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-6 space-y-6">
                  <h3 className="text-lg font-semibold">Display Options</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">Show Logo</span>
                        <span className="text-xs text-default-400">
                          Display your vendor logo on the receipt
                        </span>
                      </div>
                      <Switch
                        isSelected={watch("show_logo")}
                        onValueChange={(val) => setValue("show_logo", val)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          Show Address
                        </span>
                        <span className="text-xs text-default-400">
                          Include branch address details
                        </span>
                      </div>
                      <Switch
                        isSelected={watch("show_address")}
                        onValueChange={(val) => setValue("show_address", val)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          Show Contact Info
                        </span>
                        <span className="text-xs text-default-400">
                          Include phone and email details
                        </span>
                      </div>
                      <Switch
                        isSelected={watch("show_contact_info")}
                        onValueChange={(val) =>
                          setValue("show_contact_info", val)
                        }
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardBody className="p-6">
                  <h3 className="text-sm font-bold mb-4 uppercase text-default-400">
                    Preview
                  </h3>
                  <div className="p-4 bg-white border rounded shadow-inner font-mono text-[10px] space-y-2">
                    <div className="text-center border-b pb-2">
                      {watch("show_logo") && (
                        <div className="w-8 h-8 bg-gray-200 mx-auto mb-1 rounded-full flex items-center justify-center text-[6px]">
                          LOGO
                        </div>
                      )}
                      <div className="font-bold uppercase">
                        {vendor?.name || "VENDOR NAME"}
                      </div>
                      {watch("show_address") && (
                        <div>123 Business St, City</div>
                      )}
                      {watch("show_contact_info") && <div>+1 234 567 890</div>}
                    </div>
                    <div className="py-2 space-y-1">
                      <div className="text-center italic">
                        {watch("header_text") || "Header Text Goes Here"}
                      </div>
                      <div className="pt-2 border-t border-dashed">
                        <div className="flex justify-between">
                          <span>Item 1 x 1</span>
                          <span>$10.00</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2">
                          <span>TOTAL</span>
                          <span>$10.00</span>
                        </div>
                      </div>
                      <div className="text-center pt-4 italic">
                        {watch("footer_text") || "Footer Text Goes Here"}
                      </div>
                    </div>
                    <div className="text-center text-[6px] text-default-400">
                      {new Date().toLocaleString()}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </PermissionGuard>
  );
}
