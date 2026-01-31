"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function StaffLegacyPage() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    router.replace(`/pos/vendor/${params.vendorId}/users`);
  }, [router, params.vendorId]);

  return null;
}
