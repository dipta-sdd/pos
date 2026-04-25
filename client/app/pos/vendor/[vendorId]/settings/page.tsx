"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Switch,
  Divider,
  Tab,
  Tabs,
} from "@heroui/react";
import {
  TabletSmartphone,
  Percent,
  Coins,
  Save,
  Keyboard,
  MousePointer2,
  Printer,
} from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/api";

interface PosSettings {
  pos_interface: "touch" | "keyboard";
  vat_rate: number;
  currency_symbol: string;
  receipt_print_mode: "browser" | "thermal";
  auto_print_receipt: boolean;
}

export default function PosSettingsPage() {
  const params = useParams();
  const vendorId = params.vendorId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<PosSettings>({
    pos_interface: "touch",
    vat_rate: 5,
    currency_symbol: "৳",
    receipt_print_mode: "browser",
    auto_print_receipt: false,
  });

  useEffect(() => {
    fetchSettings();
  }, [vendorId]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response: any = await api.get(`/vendors/${vendorId}`);

      if (response.data.settings) {
        setSettings({
          ...settings,
          ...response.data.settings,
        });
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await api.put(`/vendors/${vendorId}/settings`, {
        settings: settings,
      });
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Failed to save settings", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-default-200 animate-pulse rounded-lg mb-8" />
        <Card className="p-4">
          <CardBody className="space-y-4">
            <div className="h-12 w-full bg-default-100 animate-pulse rounded-lg" />
            <div className="h-12 w-full bg-default-100 animate-pulse rounded-lg" />
            <div className="h-12 w-full bg-default-100 animate-pulse rounded-lg" />
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">
            POS Settings
          </h1>
          <p className="text-default-500 text-sm">
            Configure your point-of-sale experience and business rules.
          </p>
        </div>
        <Button
          className="font-bold"
          color="primary"
          isLoading={isSaving}
          size="lg"
          startContent={<Save size={20} />}
          onPress={handleSave}
        >
          SAVE CHANGES
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* General Settings */}
        <div className="md:col-span-2 space-y-8">
          <Card className="border-none shadow-sm bg-content1">
            <CardHeader className="flex gap-3 px-6 pt-6">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <TabletSmartphone size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-md font-bold uppercase tracking-wider">
                  POS Interface
                </p>
                <p className="text-xs text-default-400">
                  Choose the default layout for your registers.
                </p>
              </div>
            </CardHeader>
            <CardBody className="px-6 py-4">
              <Tabs
                classNames={{
                  tabList: "w-full",
                  tab: "h-24",
                }}
                color="primary"
                selectedKey={settings.pos_interface}
                variant="bordered"
                onSelectionChange={(key) =>
                  setSettings({ ...settings, pos_interface: key as any })
                }
              >
                <Tab
                  key="touch"
                  title={
                    <div className="flex flex-col items-center gap-2 py-2">
                      <MousePointer2 size={24} />
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-sm">
                          Touch Optimized
                        </span>
                        <span className="text-[10px] opacity-60">
                          Large buttons, visual products
                        </span>
                      </div>
                    </div>
                  }
                />
                <Tab
                  key="keyboard"
                  title={
                    <div className="flex flex-col items-center gap-2 py-2">
                      <Keyboard size={24} />
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-sm">
                          Keyboard Native
                        </span>
                        <span className="text-[10px] opacity-60">
                          Fast entry, dense data, shortcuts
                        </span>
                      </div>
                    </div>
                  }
                />
              </Tabs>
            </CardBody>
          </Card>

          <Card className="border-none shadow-sm bg-content1">
            <CardHeader className="flex gap-3 px-6 pt-6">
              <div className="p-2 bg-success/10 rounded-lg text-success">
                <Coins size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-md font-bold uppercase tracking-wider">
                  Financials
                </p>
                <p className="text-xs text-default-400">
                  Currency and tax configurations.
                </p>
              </div>
            </CardHeader>
            <CardBody className="px-6 py-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Default VAT Rate (%)"
                  labelPlacement="outside"
                  placeholder="5"
                  startContent={
                    <Percent className="text-default-400" size={16} />
                  }
                  type="number"
                  value={settings.vat_rate.toString()}
                  variant="bordered"
                  onValueChange={(val) =>
                    setSettings({ ...settings, vat_rate: parseFloat(val) || 0 })
                  }
                />
                <Input
                  label="Currency Symbol"
                  labelPlacement="outside"
                  placeholder="৳"
                  value={settings.currency_symbol}
                  variant="bordered"
                  onValueChange={(val) =>
                    setSettings({ ...settings, currency_symbol: val })
                  }
                />
              </div>
            </CardBody>
          </Card>

          <Card className="border-none shadow-sm bg-content1">
            <CardHeader className="flex gap-3 px-6 pt-6">
              <div className="p-2 bg-warning/10 rounded-lg text-warning">
                <Printer size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-md font-bold uppercase tracking-wider">
                  Receipt & Printing
                </p>
                <p className="text-xs text-default-400">
                  Configure how receipts are printed after checkout.
                </p>
              </div>
            </CardHeader>
            <CardBody className="px-6 py-6 space-y-6">
              <div>
                <p className="text-sm font-bold mb-3">Print Method</p>
                <Tabs
                  classNames={{
                    tabList: "w-full",
                    tab: "h-16",
                  }}
                  color="primary"
                  selectedKey={settings.receipt_print_mode}
                  variant="bordered"
                  onSelectionChange={(key) =>
                    setSettings({ ...settings, receipt_print_mode: key as any })
                  }
                >
                  <Tab
                    key="browser"
                    title={
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-bold text-sm">Browser Print</span>
                        <span className="text-[10px] opacity-60">
                          Uses system print dialog
                        </span>
                      </div>
                    }
                  />
                  <Tab
                    key="thermal"
                    title={
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-bold text-sm">
                          Thermal / ESC/POS
                        </span>
                        <span className="text-[10px] opacity-60">
                          Direct to thermal printer
                        </span>
                      </div>
                    }
                  />
                </Tabs>
              </div>

              <Divider />

              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold">Auto-Print Receipt</p>
                  <p className="text-xs text-default-400">
                    Automatically trigger print after each completed sale.
                  </p>
                </div>
                <Switch
                  isSelected={settings.auto_print_receipt}
                  onValueChange={(val) =>
                    setSettings({ ...settings, auto_print_receipt: val })
                  }
                />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar help / quick info */}
        <div className="space-y-6">
          <Card className="bg-primary text-white border-none shadow-xl">
            <CardBody className="p-6">
              <h3 className="font-bold text-lg mb-2">Need Help?</h3>
              <p className="text-sm opacity-90 leading-relaxed">
                These settings apply to all branches and registers for your
                business. Changes are saved instantly to the cloud but may
                require a page refresh on active POS terminals to take effect.
              </p>
            </CardBody>
          </Card>

          <Card className="bg-default-100 border-none">
            <CardBody className="p-6 space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-default-500">
                Upcoming Features
              </h4>
              <ul className="text-xs space-y-3">
                <li className="flex items-center gap-2 opacity-50">
                  <div className="w-1.5 h-1.5 rounded-full bg-default-400" />
                  Multi-currency support
                </li>
                <li className="flex items-center gap-2 opacity-50">
                  <div className="w-1.5 h-1.5 rounded-full bg-default-400" />
                  Custom barcode formats
                </li>
                <li className="flex items-center gap-2 opacity-50">
                  <div className="w-1.5 h-1.5 rounded-full bg-default-400" />
                  Loyalty point rules
                </li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
