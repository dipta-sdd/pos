"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";

interface POSGuardProps {
  children: React.ReactNode;
}

export function POSGuard({ children }: POSGuardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasVendor, setHasVendor] = useState(false);
  const [hasBranch, setHasBranch] = useState(false);

  useEffect(() => {
    const checkPOSAccess = async () => {
      if (!user) return;

      try {
        // Check if user has vendor
        const vendorResponse = await api.get('/vendors/check');
        
        if (vendorResponse.status === 200) {
          const vendorData = vendorResponse.data as any;
          setHasVendor(vendorData.hasVendor);
          
          if (vendorData.hasVendor) {
            // Check if user has branch
            const branchResponse = await api.get('/branches/check');
            
            if (branchResponse.status === 200) {
              const branchData = branchResponse.data as any;
              setHasBranch(branchData.hasBranch);
            }
          }
        }
      } catch (error) {
        console.error('Error checking POS access:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkPOSAccess();
  }, [user]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  // If user doesn't have vendor, redirect to onboarding
  if (!hasVendor) {
    router.push('/onboarding/vendor');
    return null;
  }

  // If user has vendor but no branch, redirect to branch setup
  if (hasVendor && !hasBranch) {
    router.push('/onboarding/branch');
    return null;
  }

  // If user has both vendor and branch, allow access to POS
  if (hasVendor && hasBranch) {
    return <>{children}</>;
  }

  // Default case - redirect to onboarding
  router.push('/onboarding/vendor');
  return null;
} 