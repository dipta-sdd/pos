"use client";

import { AuthGuard } from "@/components/auth-guard";
import { Navbar2 } from "@/components/navbar2";
import Sidebar from "@/components/sidebar";

export default function POSLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard redirectTo="/login" requireAuth={true}>
      <div className="relative flex flex-row h-screen ">
        <div className="bg-gray-900 ">
          <Sidebar />
        </div>
        <div className="flex flex-grow h-screen overflow-auto">
          <div className="w-full min-h-screen-w-nav  p4">
            <div className="w-full flex flex-col items-stretch">
              <Navbar2 />
              {children}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
