"use client";

import { Button } from "@heroui/button";
import { Download } from "lucide-react";
import { usePWA } from "@/lib/hooks/usePWA";

interface InstallPWAProps {
  collapsed?: boolean;
  variant?: "sidebar" | "navbar";
}

export default function InstallPWA({
  collapsed = false,
  variant = "sidebar",
}: InstallPWAProps) {
  const { isInstallable, install } = usePWA();
  console.log(isInstallable);

  if (!isInstallable) return null;

  if (variant === "navbar") {
    return (
      <Button
        className="font-semibold h-9 min-w-min px-2"
        color="primary"
        size="sm"
        variant="light"
        onPress={install}
        startContent={<Download className="w-4 h-4" />}
      ></Button>
    );
  }

  return (
    <div className="px-2 py-4 mt-auto border-t border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button
        className={`w-full font-semibold transition-all duration-300 ${collapsed ? "min-w-0 p-0" : ""}`}
        color="primary"
        size={collapsed ? "sm" : "md"}
        variant="flat"
        onPress={install}
        isIconOnly={collapsed}
      >
        <Download className={`${collapsed ? "w-5 h-5" : "w-4 h-4 mr-2"}`} />
        {!collapsed && <span>Install App</span>}
      </Button>
      {!collapsed && (
        <p className="text-[10px] text-center text-gray-500 mt-2">
          Install for a better experience
        </p>
      )}
    </div>
  );
}
