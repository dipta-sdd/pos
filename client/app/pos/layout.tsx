"use client";

import { Navbar } from "@/components/navbar";
import { AuthGuard } from "@/components/auth-guard";

export default function POSLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={true} redirectTo="/login">
      <div className="w-full flex flex-col items-stretch">
        <Navbar />
        {children}
      </div>
    </AuthGuard>
  );
}
