"use client";

import { useVendor } from "@/lib/contexts/VendorContext";
import { Role } from "@/lib/types/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: keyof Role;
  fallback?: React.ReactNode;
}

export default function PermissionGuard({
  children,
  permission,
  fallback,
}: PermissionGuardProps) {
  const { currentRole, isLoading } = useVendor();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && currentRole && !currentRole[permission]) {
      // If no fallback provided, redirect to dashboard
      if (!fallback) {
        // Find main vendor path
        const vendorId = currentRole.vendor_id;
        router.push(`/pos/vendor/${vendorId}`);
      }
    }
  }, [currentRole, isLoading, permission, router, fallback]);

  if (isLoading) {
    return <div className="p-4">Loading permissions...</div>;
  }

  if (!currentRole) {
    return null;
  }

  // Check if user has permission
  // Note: We cast to any because we know permission is a key of Role,
  // but TS doesn't know for sure it's a boolean, though in our case permission keys are booleans.
  if ((currentRole as any)[permission]) {
    return <>{children}</>;
  }

  // If we have a fallback, show it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Otherwise return null (useEffect handles redirect)
  return null;
}
