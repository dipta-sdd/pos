"use client";

import { useEffect } from "react";
import { Button } from "@heroui/button";
import { AlertTriangle, RefreshCw, ChevronLeft, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VendorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Vendor Context Error:", error);
  }, [error]);

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-6 bg-gray-50/50 dark:bg-black/10 animate-in fade-in duration-500">
      <div className="max-w-2xl w-full text-center space-y-8 bg-white dark:bg-gray-900 p-12 rounded-3xl border border-default-200 shadow-xl shadow-default-100/50 dark:shadow-none">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-warning/20 blur-2xl rounded-full" />
            <div className="relative p-6 bg-warning-50 dark:bg-warning-900/20 rounded-2xl border border-warning-100 dark:border-warning-900/30">
              <AlertTriangle className="w-16 h-16 text-warning" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            Something went wrong
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            We encountered an issue while loading this section. This might be a temporary connection problem.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            color="primary"
            size="lg"
            className="font-semibold px-8"
            startContent={<RefreshCw className="w-5 h-5" />}
            onPress={() => reset()}
          >
            Try Again
          </Button>
          <Button
            variant="flat"
            size="lg"
            className="font-semibold px-8"
            startContent={<Home className="w-5 h-5" />}
            onPress={() => router.push("/pos")}
          >
            Dashboard
          </Button>
        </div>
        
        {error.message && (
          <div className="pt-8 mt-8 border-t border-default-100">
            <div className="bg-default-50 dark:bg-default-100/50 p-4 rounded-xl text-left">
              <p className="text-[11px] font-mono text-default-500 uppercase tracking-widest mb-1">Error Details</p>
              <p className="text-xs font-mono text-danger-500 dark:text-danger-400 break-all leading-tight">
                {error.message}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
