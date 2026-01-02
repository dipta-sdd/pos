"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/pos/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-9xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            404
          </div>
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Page Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Oops! The page you're looking for doesn't exist.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => router.push("/pos/")}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Go Home
          </button>
          <button
            onClick={() => router.back()}
            className="w-full px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-blue-600 dark:hover:border-blue-500 transition-all duration-200"
          >
            Go Back
          </button>
        </div>

        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          Redirecting to home in 5 seconds...
        </p>
      </div>
    </div>
  );
}
