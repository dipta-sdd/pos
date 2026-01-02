"use client";
import VendorNavbar from "@/components/vendor/VendorNavbar";
import Sidebar from "@/components/sidebar";
import { VendorProvider } from "@/lib/contexts/VendorContext";

export default function VendorPOSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <VendorProvider>
      <div className="relative flex flex-row h-screen ">
        <div className="bg-gray-900 ">
          <Sidebar />
        </div>
        <div className="flex flex-grow h-screen overflow-auto">
          <div className="w-full min-h-screen-w-nav">
            <div className="w-full flex flex-col items-stretch">
              <VendorNavbar />
              {children}
            </div>
          </div>
        </div>
      </div>
    </VendorProvider>
  );
}
