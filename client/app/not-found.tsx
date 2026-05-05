"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Home, ArrowLeft, Ghost } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/pos/");
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-white dark:bg-black">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-600/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-2xl w-full px-6 text-center space-y-12">
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
              <div className="relative p-8 bg-default-50 dark:bg-default-100 rounded-[2.5rem] border border-default-200/50 shadow-2xl">
                <Ghost className="w-20 h-20 text-blue-600 dark:text-blue-500 animate-bounce" />
              </div>
            </div>
          </div>

          <div className="relative inline-block">
            <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-blue-600 via-blue-700 to-purple-800 dark:from-white dark:to-gray-500">
              404
            </h1>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
              Lost in the void?
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
              We couldn&apos;t find the page you&apos;re looking for. It might
              have been moved, deleted, or never existed in the first place.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
          <Button
            className="h-14 px-8 text-base font-bold rounded-2xl shadow-xl shadow-blue-500/20 w-full sm:w-auto"
            color="primary"
            size="lg"
            startContent={<Home className="w-5 h-5" />}
            variant="solid"
            onPress={() => router.push("/pos/")}
          >
            Back to Dashboard
          </Button>
          <Button
            className="h-14 px-8 text-base font-semibold rounded-2xl border border-default-200/50 w-full sm:w-auto"
            size="lg"
            startContent={<ArrowLeft className="w-5 h-5" />}
            variant="flat"
            onPress={() => router.back()}
          >
            Go Back
          </Button>
        </div>

        <div className="pt-8 animate-in fade-in duration-1000 delay-500">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-default-100/50 dark:bg-default-50/5 rounded-full border border-default-200/20 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            <p className="text-xs font-medium text-default-500">
              Redirecting to Home in{" "}
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {countdown}s
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Grid Pattern Decoration */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}
