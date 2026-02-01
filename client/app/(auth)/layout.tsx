"use client";

import { ThemeSwitch } from "@/components/theme-switch";
import { AuthGuard } from "@/components/auth-guard";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard redirectTo="/pos" requireAuth={false}>
      <div className="min-h-screen  relative">
        {children}

        {/* Theme Switch - Bottom Right Corner */}
        <div className="fixed bottom-6 right-6 z-50">
          <ThemeSwitch />
        </div>
      </div>
    </AuthGuard>
  );
}
