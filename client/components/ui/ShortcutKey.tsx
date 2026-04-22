import React from "react";
import { Kbd } from "@heroui/react";

export const ShortcutKey = ({ children }: { children: React.ReactNode }) => (
  <Kbd className="bg-white/20 px-1.5 py-0.5 rounded font-black text-[11px] text-white border border-white/30 shadow-none">
    {children}
  </Kbd>
);
