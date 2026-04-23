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
  Select,
  SelectItem,
  Divider,
  Tab,
  Tabs,
} from "@heroui/react";
import {
  TabletSmartphone,
  Percent,
  Warehouse,
  Coins,
  Save,
  Keyboard,
  MousePointer2,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface PosSettings {
  pos_interface: "touch" | "keyboard";
  vat_rate: number;
  low_stock_threshold: number;
  currency_symbol: string;
  show_out_of_stock: boolean;
}

export default function PosSettingsPage() {
  const params = useParams();
  const vendorId = params.vendorId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<PosSettings>({
    pos_interface: "touch",
    vat_rate: 5,
    low_stock_threshold: 10,
    currency_symbol: "৳",
    show_out_of_stock: true,
  });

  useEffect(() => {
    fetchSettings();
  }, [vendorId]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/vendors/${vendorId}`);
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
          <h1 className="text-3xl font-black uppercase tracking-tight">POS Settings</h1>
          <p className="text-default-500 text-sm">Configure your point-of-sale experience and business rules.</p>
        </div>
        <Button
          color="primary"
          size="lg"
          className="font-bold"
          startContent={<Save size={20} />}
          isLoading={isSaving}
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
                <p className="text-md font-bold uppercase tracking-wider">POS Interface</p>
                <p className="text-xs text-default-400">Choose the default layout for your registers.</p>
              </div>
            </CardHeader>
            <CardBody className="px-6 py-4">
              <Tabs 
                selectedKey={settings.pos_interface}
                onSelectionChange={(key) => setSettings({ ...settings, pos_interface: key as any })}
                variant="bordered"
                color="primary"
                classNames={{
                  tabList: "w-full",
                  tab: "h-24",
                }}
              >
                <Tab 
                  key="touch" 
                  title={
                    <div className="flex flex-col items-center gap-2 py-2">
                      <MousePointer2 size={24} />
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-sm">Touch Optimized</span>
                        <span className="text-[10px] opacity-60">Large buttons, visual products</span>
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
                        <span className="font-bold text-sm">Keyboard Native</span>
                        <span className="text-[10px] opacity-60">Fast entry, dense data, shortcuts</span>
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
                <p className="text-md font-bold uppercase tracking-wider">Financials</p>
                <p className="text-xs text-default-400">Currency and tax configurations.</p>
              </div>
            </CardHeader>
            <CardBody className="px-6 py-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Default VAT Rate (%)"
                  labelPlacement="outside"
                  placeholder="5"
                  type="number"
                  variant="bordered"
                  value={settings.vat_rate.toString()}
                  onValueChange={(val) => setSettings({ ...settings, vat_rate: parseFloat(val) || 0 })}
                  startContent={<Percent size={16} className="text-default-400" />}
                />
                <Input
                  label="Currency Symbol"
                  labelPlacement="outside"
                  placeholder="৳"
                  variant="bordered"
                  value={settings.currency_symbol}
                  onValueChange={(val) => setSettings({ ...settings, currency_symbol: val })}
                />
              </div>
            </CardBody>
          </Card>

          <Card className="border-none shadow-sm bg-content1">
            <CardHeader className="flex gap-3 px-6 pt-6">
              <div className="p-2 bg-warning/10 rounded-lg text-warning">
                <Warehouse size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-md font-bold uppercase tracking-wider">Inventory Rules</p>
                <p className="text-xs text-default-400">Manage how stock affects your POS.</p>
              </div>
            </CardHeader>
            <CardBody className="px-6 py-6 space-y-8">
              <Input
                label="Low Stock Threshold"
                labelPlacement="outside"
                placeholder="10"
                type="number"
                variant="bordered"
                value={settings.low_stock_threshold.toString()}
                onValueChange={(val) => setSettings({ ...settings, low_stock_threshold: parseInt(val) || 0 })}
                description="Products below this quantity will be flagged in the system."
              />
              
              <Divider />

              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold">Show Out of Stock Products</p>
                  <p className="text-xs text-default-400">Allow products with zero stock to be visible in POS selection.</p>
                </div>
                <Switch 
                  isSelected={settings.show_out_of_stock}
                  onValueChange={(val) => setSettings({ ...settings, show_out_of_stock: val })}
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
                These settings apply to all branches and registers for your business. 
                Changes are saved instantly to the cloud but may require a page refresh on active POS terminals to take effect.
              </p>
            </CardBody>
          </Card>
          
          <Card className="bg-default-100 border-none">
            <CardBody className="p-6 space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-default-500">Upcoming Features</h4>
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
