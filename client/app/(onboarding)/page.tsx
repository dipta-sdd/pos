"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    }
  }, [user, router]);

  const checkOnboardingStatus = async () => {
    try {
      // Check if user has vendor
      const vendorResponse = await api.get('/vendors/check');
      
      if (vendorResponse.status === 200) {
        const vendorData = vendorResponse.data as any;
        
        if (!vendorData.hasVendor) {
          // No vendor, redirect to vendor setup
          router.push('/onboarding/vendor');
          return;
        }

        // Check if user has branch
        const branchResponse = await api.get('/branches/check');
        
        if (branchResponse.status === 200) {
          const branchData = branchResponse.data as any;
          
          if (!branchData.hasBranch) {
            // No branch, redirect to branch setup
            router.push('/onboarding/branch');
            return;
          }

          // User has both vendor and branch, redirect to POS
          router.push('/pos');
          return;
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // On error, redirect to vendor setup
      router.push('/onboarding/vendor');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center">
        <div className="mb-6">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Setting up your business...
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we redirect you to the next step.
          </p>
        </div>
      </div>
    </div>
  );
} 