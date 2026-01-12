"use client";

import { AuthGuard } from "@/components/auth-guard";

export default function OTPLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={true} requireVerification={false}>
      {children}
    </AuthGuard>
  );
}
