"use client";

import type { Membership, Vendor, Role } from "../types/auth";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  useParams,
  useRouter,
  useSearchParams,
  usePathname,
} from "next/navigation";

import { useAuth } from "../hooks/useAuth";
import api from "../api";

interface VendorContextType {
  vendor: Vendor | null;
  membership: Membership | null;
  currentRole: Role | null;
  isLoading: boolean;
  selectedBranchIds: string[];
  updateBranchFilter: (ids: string[]) => void;
  refreshVendor: () => Promise<void>;
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
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);

  // Initialize from URL on mount
  useEffect(() => {
    const branchIds = searchParams.getAll("branch_ids[]");
    // Handle both array notation and single value (or comma separated if we supported that, but stick to array notation standard)
    // Next.js readable params might be key=val&key=val2 for branch_ids
    // Or users might manually navigate.
    // The previous implementation used get("branch_ids") which implies single. Usually frameworks differentiate.
    // Let's rely on getAll for 'branch_ids' or 'branch_ids[]'
    let ids = searchParams.getAll("branch_ids");

    if (ids.length === 0) {
      ids = searchParams.getAll("branch_ids[]");
    }

    if (ids.length > 0) {
      setSelectedBranchIds(ids);
    }
  }, [searchParams]);

  const updateBranchFilter = (ids: string[]) => {
    setSelectedBranchIds(ids);

    const current = new URLSearchParams(
      Array.from(searchParams.entries()) as [string, string][],
    );

    // Clear existing
    current.delete("branch_ids");
    current.delete("branch_ids[]");

    // Append new
    ids.forEach((id) => {
      current.append("branch_ids[]", id);
    });

    const search = current.toString();
    const query = search ? `?${search}` : "";

    router.push(`${pathname}${query}`);
  };

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
    console.log(foundMembership);
    setMembership(foundMembership);
    setVendor(foundMembership.vendor);
    setIsLoading(false);
  }, [user, authLoading, params.vendorId, router]);

  const refreshVendor = async () => {
    if (!vendor) return;
    try {
      const res: any = await api.get(`/vendors/${vendor.id}`);
      if (res.data) {
        setVendor(res.data);
      }
    } catch (e) {
      console.error("Failed to refresh vendor", e);
    }
  };

  const value = {
    vendor,
    membership,
    currentRole: membership?.role || null,
    isLoading: isLoading || authLoading,
    selectedBranchIds,
    updateBranchFilter,
    refreshVendor,
  };

  return (
    <VendorContext.Provider value={value}>{children}</VendorContext.Provider>
  );
};
