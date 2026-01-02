"use client";

import type { Membership, Vendor, Role } from "../types/auth";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useParams, useRouter } from "next/navigation";

import { useAuth } from "../hooks/useAuth";

interface VendorContextType {
  vendor: Vendor | null;
  membership: Membership | null;
  currentRole: Role | null;
  isLoading: boolean;
}

const VendorContext = createContext<VendorContextType | undefined>(undefined);

export const useVendor = () => {
  const context = useContext(VendorContext);

  if (context === undefined) {
    throw new Error("useVendor must be used within a VendorProvider");
  }

  return context;
};

interface VendorProviderProps {
  children: ReactNode;
}

export const VendorProvider = ({ children }: VendorProviderProps) => {
  const { user, isLoading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");

      return;
    }

    const vendorId = parseInt(params.vendorId as string);

    if (isNaN(vendorId)) {
      router.push("/pos");

      return;
    }

    const foundMembership = user.memberships?.find(
      (m) => m.vendor_id === vendorId,
    );

    if (!foundMembership) {
      router.push("/pos");

      return;
    }

    setMembership(foundMembership);
    setVendor(foundMembership.vendor);
    setIsLoading(false);
  }, [user, authLoading, params.vendorId, router]);

  const value = {
    vendor,
    membership,
    currentRole: membership?.role || null,
    isLoading: isLoading || authLoading,
  };

  return (
    <VendorContext.Provider value={value}>{children}</VendorContext.Provider>
  );
};
