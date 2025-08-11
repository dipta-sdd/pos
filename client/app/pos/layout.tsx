'use client'

import { Navbar } from "@/components/navbar";

export default function POSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full flex flex-col items-stretch">
      <Navbar />
      {children}
    </div>
  )
}