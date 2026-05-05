"use client";

import { Button } from "@heroui/react";
import { CheckSquare } from "lucide-react";
import React from "react";

export interface BulkAction {
  label: string;
  action: string;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  icon?: React.ReactNode;
}

interface BulkActionBarProps {
  selectedCount: number;
  actions: BulkAction[];
  onAction: (action: string) => void;
  isLoading?: boolean;
}

export default function BulkActionBar({
  selectedCount,
  actions,
  onAction,
  isLoading = false,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-lg p-3 flex items-center justify-between mb-4 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-3 text-primary-700 dark:text-primary-300">
        <CheckSquare className="w-5 h-5" />
        <span className="font-medium text-sm">
          {selectedCount} {selectedCount === 1 ? "item" : "items"} selected
        </span>
      </div>
      <div className="flex items-center gap-2">
        {actions.map((act) => (
          <Button
            key={act.action}
            color={act.color || "primary"}
            isDisabled={isLoading}
            size="sm"
            startContent={act.icon}
            variant="flat"
            onPress={() => onAction(act.action)}
          >
            {act.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
