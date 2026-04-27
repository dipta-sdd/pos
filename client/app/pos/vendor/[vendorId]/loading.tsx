"use client";

import { Skeleton } from "@heroui/skeleton";

export default function VendorLoading() {
  return (
    <div className="p-6 space-y-6 w-full min-h-[calc(100vh-64px)] animate-in fade-in duration-500 bg-gray-50/30 dark:bg-transparent">
      {/* Page Header Skeleton */}
      <div className="flex justify-between items-end mb-8">
        <div className="space-y-3">
          <Skeleton className="w-48 h-8 rounded-lg" />
          <Skeleton className="w-64 h-4 rounded-lg" />
        </div>
        <Skeleton className="w-32 h-10 rounded-lg" />
      </div>

      {/* Filter/Search Bar Skeleton */}
      <div className="flex justify-between gap-3 items-end mb-4">
        <Skeleton className="w-full sm:max-w-[44%] h-10 rounded-lg" />
        <div className="flex gap-3">
          <Skeleton className="w-24 h-10 rounded-lg" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="border border-default-200 dark:border-default-100 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-6 gap-4 p-5 bg-default-50 border-b border-default-200">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full rounded" />
          ))}
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-default-100">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4 p-5 items-center">
              {Array.from({ length: 6 }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-full rounded opacity-70" />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-between items-center mt-4">
        <Skeleton className="w-48 h-8 rounded-lg" />
        <Skeleton className="w-32 h-8 rounded-lg" />
      </div>
    </div>
  );
}
