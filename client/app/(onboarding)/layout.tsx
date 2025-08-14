"use client";

import { ThemeSwitch } from "@/components/theme-switch";
import { AuthGuard } from "@/components/auth-guard";
import { OnboardingGuard } from "@/components/onboarding-guard";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAuth={true} redirectTo="/login">
      <OnboardingGuard>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative">
          {children}

          {/* Theme Switch - Bottom Right Corner */}
          <div className="fixed bottom-6 right-6 z-50">
            <ThemeSwitch />
          </div>
        </div>
      </OnboardingGuard>
    </AuthGuard>
  );
} 