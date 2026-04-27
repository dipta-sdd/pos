"use client";

import { Button } from "@heroui/button";
import { Search, ArrowLeft, Home } from "lucide-react";
import { useRouter } from "next/navigation";

interface ResourceNotFoundProps {
  title: string;
  message?: string;
  backLink?: string;
  backLabel?: string;
}

export default function ResourceNotFound({
  title,
  message = "The requested resource could not be found. It might have been deleted or moved.",
  backLink,
  backLabel = "Go Back",
}: ResourceNotFoundProps) {
  const router = useRouter();

  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-default-200/50 blur-3xl rounded-full" />
        <div className="relative p-8 bg-default-50 dark:bg-default-100 rounded-3xl border border-default-200/50 shadow-sm">
          <Search className="w-16 h-16 text-default-400" />
        </div>
      </div>

      <div className="text-center space-y-3 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tight">
          {title} Not Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
          {message}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-10">
        <Button
          variant="flat"
          size="lg"
          className="font-semibold px-8 rounded-2xl"
          startContent={<ArrowLeft className="w-4 h-4" />}
          onPress={() => (backLink ? router.push(backLink) : router.back())}
        >
          {backLabel}
        </Button>
        <Button
          color="primary"
          size="lg"
          className="font-semibold px-8 rounded-2xl shadow-lg shadow-blue-500/20"
          startContent={<Home className="w-4 h-4" />}
          onPress={() => router.push("/pos")}
        >
          Dashboard
        </Button>
      </div>
    </div>
  );
}
