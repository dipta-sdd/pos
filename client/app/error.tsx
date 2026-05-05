"use client";

import { useEffect } from "react";
import { Button } from "@heroui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-danger-50 dark:bg-danger-900/20 rounded-full">
            <AlertCircle className="w-12 h-12 text-danger" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Something went wrong
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            An unexpected error occurred. We&apos;ve been notified and are
            looking into it.
          </p>
          {error.digest && (
            <p className="text-xs text-gray-400 font-mono">
              ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Button
            color="primary"
            size="lg"
            startContent={<RefreshCw className="w-4 h-4" />}
            onPress={() => reset()}
          >
            Try Again
          </Button>
          <Button
            size="lg"
            startContent={<Home className="w-4 h-4" />}
            variant="flat"
            onPress={() => router.push("/pos")}
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
