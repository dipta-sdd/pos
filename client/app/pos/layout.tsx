"use client";

import { Navbar } from "@/components/navbar";
import { AuthGuard } from "@/components/auth-guard";
import { Navbar2 } from "@/components/navbar2";

export default function POSLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={true} redirectTo="/login">
      <div className="w-full flex flex-col items-stretch">
        <Navbar2 />
        {children}
      </div>
    </AuthGuard>
  );
}
