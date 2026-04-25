"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Printer } from "lucide-react";
import { Switch, Select, SelectItem } from "@heroui/react";

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
    paper_size: z.enum(["58mm", "80mm", "a4"]),
    font_size: z.enum(["small", "medium", "large"]),
    show_tax_breakdown: z.boolean(),
    show_payment_details: z.boolean(),
    show_barcode: z.boolean(),
    show_salesperson: z.boolean(),
    show_sale_id: z.boolean(),
    show_date_time: z.boolean(),
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
      paper_size: "80mm",
      font_size: "medium",
      show_tax_breakdown: true,
      show_payment_details: true,
      show_barcode: false,
      show_salesperson: true,
      show_sale_id: true,
      show_date_time: true,
      vendor_id: vendor?.id,
    },
  });

  const [isNew, setIsNew] = useState(false);

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
          show_tax_breakdown: Boolean(response.data.show_tax_breakdown),
          show_payment_details: Boolean(response.data.show_payment_details),
          show_barcode: Boolean(response.data.show_barcode),
          show_salesperson: Boolean(response.data.show_salesperson),
          show_sale_id: Boolean(response.data.show_sale_id),
          show_date_time: Boolean(response.data.show_date_time),
          paper_size: response.data.paper_size || "80mm",
          font_size: response.data.font_size || "medium",
          vendor_id: vendor?.id,
        });
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        // No settings yet — will create on save
        setIsNew(true);
        reset({
          show_logo: false,
          show_address: true,
          show_contact_info: true,
          paper_size: "80mm",
          font_size: "medium",
          show_tax_breakdown: true,
          show_payment_details: true,
          show_barcode: false,
          show_salesperson: true,
          show_sale_id: true,
          show_date_time: true,
          vendor_id: vendor?.id,
        });
      } else {
        console.error("Failed to fetch receipt settings", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (isNew) {
        await api.post(`/receipt-settings`, data);
        setIsNew(false);
      } else {
        await api.put(`/receipt-settings/${vendor?.id}`, data);
      }
      toast.success("Receipt settings saved successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save settings");
    }
  };

  if (contextLoading || loading) return <UserLoding />;

  const fontSizeMap: Record<string, string> = {
    small: "text-[8px]",
    medium: "text-[10px]",
    large: "text-xs",
  };
  const previewFontSize = fontSizeMap[watch("font_size")] || "text-[10px]";

  const paperWidthMap: Record<string, string> = {
    "58mm": "max-w-[200px]",
    "80mm": "max-w-[280px]",
    a4: "max-w-full",
  };
  const previewPaperWidth = paperWidthMap[watch("paper_size")] || "max-w-[280px]";

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

              {/* Content Options */}
              <Card>
                <CardBody className="p-6 space-y-6">
                  <h3 className="text-lg font-semibold">Content Options</h3>
                  <div className="space-y-4">
                    {[
                      { key: "show_tax_breakdown" as const, label: "Show Tax Breakdown", desc: "Display individual tax amounts on the receipt" },
                      { key: "show_payment_details" as const, label: "Show Payment Details", desc: "Show received amount and change for each payment" },
                      { key: "show_salesperson" as const, label: "Show Salesperson", desc: "Display the cashier/salesperson name" },
                      { key: "show_sale_id" as const, label: "Show Sale ID", desc: "Display the sale reference number" },
                      { key: "show_date_time" as const, label: "Show Date & Time", desc: "Display the transaction date and time" },
                      { key: "show_barcode" as const, label: "Show Barcode", desc: "Display a barcode for the sale ID" },
                    ].map((opt) => (
                      <div key={opt.key} className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{opt.label}</span>
                          <span className="text-xs text-default-400">{opt.desc}</span>
                        </div>
                        <Switch
                          isSelected={watch(opt.key)}
                          onValueChange={(val) => setValue(opt.key, val)}
                        />
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Format Options */}
              <Card>
                <CardBody className="p-6 space-y-6">
                  <h3 className="text-lg font-semibold">Format Options</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Paper Size</label>
                      <Select
                        selectedKeys={new Set([watch("paper_size")])}
                        onSelectionChange={(keys) => {
                          const val = Array.from(keys as Set<string>)[0];
                          if (val) setValue("paper_size", val as any);
                        }}
                        variant="bordered"
                        size="sm"
                      >
                        <SelectItem key="58mm">58mm (Small thermal)</SelectItem>
                        <SelectItem key="80mm">80mm (Standard thermal)</SelectItem>
                        <SelectItem key="a4">A4 (Full page)</SelectItem>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Font Size</label>
                      <Select
                        selectedKeys={new Set([watch("font_size")])}
                        onSelectionChange={(keys) => {
                          const val = Array.from(keys as Set<string>)[0];
                          if (val) setValue("font_size", val as any);
                        }}
                        variant="bordered"
                        size="sm"
                      >
                        <SelectItem key="small">Small</SelectItem>
                        <SelectItem key="medium">Medium</SelectItem>
                        <SelectItem key="large">Large</SelectItem>
                      </Select>
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
                  <div className={`p-4 bg-white border rounded shadow-inner font-mono ${previewFontSize} space-y-2 mx-auto ${previewPaperWidth} text-black`}>
                    <div className="text-center border-b pb-2">
                      {watch("show_logo") && (
                        <div className="w-8 h-8 bg-gray-200 mx-auto mb-1 rounded-full flex items-center justify-center text-[6px] font-bold">
                          LOGO
                        </div>
                      )}
                      <div className="font-bold uppercase tracking-wider">
                        {vendor?.name || "VENDOR NAME"}
                      </div>
                      {watch("show_address") && (
                        <div className="text-gray-500">{vendor?.address || "Business Address"}</div>
                      )}
                      {watch("show_contact_info") && <div className="text-gray-500">Tel: {vendor?.phone || "Contact Info"}</div>}
                    </div>

                    {watch("header_text") && (
                      <div className="text-center italic text-gray-500">
                        {watch("header_text")}
                      </div>
                    )}

                    <div className="flex justify-between text-gray-500">
                      {watch("show_sale_id") && <span>Sale #12345</span>}
                      {watch("show_date_time") && <span>{new Date().toLocaleString()}</span>}
                    </div>
                    {watch("show_salesperson") && (
                      <div className="text-gray-500">Cashier: Jane Doe</div>
                    )}

                    <div className="py-2 space-y-1">
                      <div className="border-b border-dashed pb-1 mb-1 font-bold flex justify-between">
                        <span>Item</span>
                        <span>Total</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Product A x 2</span>
                        <span>$20.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Product B x 1</span>
                        <span>$15.00</span>
                      </div>
                      
                      <div className="pt-2 border-t border-dashed mt-2">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>$35.00</span>
                        </div>
                        {watch("show_tax_breakdown") && (
                          <div className="flex justify-between">
                            <span>VAT</span>
                            <span>$3.50</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold pt-1 text-sm">
                          <span>TOTAL</span>
                          <span>$38.50</span>
                        </div>
                      </div>

                      {watch("show_payment_details") && (
                        <div className="pt-2">
                          <div className="font-bold uppercase text-gray-500">Payment(s)</div>
                          <div className="flex justify-between">
                            <span>Cash</span>
                            <span>$40.00</span>
                          </div>
                          <div className="flex justify-between text-gray-400">
                            <span>Change</span>
                            <span>$1.50</span>
                          </div>
                        </div>
                      )}

                      {watch("show_barcode") && (
                        <div className="pt-4 pb-2 text-center">
                          <div className="w-3/4 h-8 bg-gray-300 mx-auto rounded-sm flex items-center justify-center">
                            <span className="text-[6px] tracking-[4px] font-bold text-gray-600">|| |||| | ||| ||</span>
                          </div>
                        </div>
                      )}

                      {watch("footer_text") && (
                        <div className="text-center pt-2 italic text-gray-500">
                          {watch("footer_text")}
                        </div>
                      )}
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
