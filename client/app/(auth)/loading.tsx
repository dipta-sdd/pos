"use client";

import { Spinner } from "@heroui/react";

export default function AuthLoading() {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
      <Spinner size="lg" color="primary" labelColor="primary" />
      <p className="text-sm font-medium text-default-500">
        Securing your session...
      </p>
    </div>
  );
}
