"use client";

import { Button } from "@heroui/button";
import { Plus, X } from "lucide-react";

import { PosTab } from "@/lib/types/pos";

interface TabSectionProps {
  tabs: PosTab[];
  activeTabId: string;
  onTabSelect: (id: string) => void;
  onTabClose: (id: string) => void;
  onTabAdd: () => void;
}

export default function TabSection({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onTabAdd,
}: TabSectionProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-200 dark:bg-gray-900 p-1 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-t-lg cursor-pointer transition-all min-w-[120px] max-w-[200px] border-none outline-none
            ${
              tab.id === activeTabId
                ? "bg-white dark:bg-gray-800 text-primary shadow-sm"
                : "bg-transparent text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-800"
            }
          `}
          type="button"
          onClick={() => onTabSelect(tab.id)}
        >
          <span className="text-xs font-bold truncate flex-1 text-left">
            {tab.customer?.name || tab.name}
          </span>
          {tabs.length > 1 && (
            <button
              className="hover:text-danger rounded-full p-0.5"
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </button>
      ))}
      <Button
        isIconOnly
        className="ml-1"
        size="sm"
        variant="light"
        onPress={onTabAdd}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
