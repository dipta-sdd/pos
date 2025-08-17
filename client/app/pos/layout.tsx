"use client";

import { AuthGuard } from "@/components/auth-guard";
import { Navbar2 } from "@/components/navbar2";
import Sidebar from "@/components/sidebar";

export default function POSLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard redirectTo="/login" requireAuth={true}>
      {children}
    </AuthGuard>
  );
}
