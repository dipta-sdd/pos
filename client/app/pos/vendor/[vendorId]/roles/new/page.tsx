"use client";

import { useVendor } from "@/lib/contexts/VendorContext";
import { useRouter } from "next/navigation";

export default function NewRolePage() {
  const { vendor, isLoading } = useVendor();
  const router = useRouter();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create New Role
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-500">
          Role creation form will be implemented here.
        </p>
      </div>
    </div>
  );
}
