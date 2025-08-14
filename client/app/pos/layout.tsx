"use client";

import { Navbar } from "@/components/navbar";
import { AuthGuard } from "@/components/auth-guard";
import { POSGuard } from "@/components/pos-guard";

export default function POSLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={true} redirectTo="/login">
      <POSGuard>
    <div className="w-full flex flex-col items-stretch">
      <Navbar />
      {children}
    </div>
      </POSGuard>
    </AuthGuard>
  );
}
