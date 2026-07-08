"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { useTenant } from "@/hooks/use-tenant";
import { createTenantLink } from "@/lib/tenant-navigation";
import { getPortalBaseForRole, type ClinicRoleType } from "@/lib/portal";

export default function TenantRootPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const tenant = useTenant();

  useEffect(() => {
    if (loading) return;
    if (user) {
      const portal = getPortalBaseForRole((user.clinicRole ?? "PATIENT") as ClinicRoleType);
      router.replace(createTenantLink(tenant, portal));
    } else {
      router.replace(createTenantLink(tenant, "/auth/login"));
    }
  }, [user, loading, tenant, router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "linear-gradient(180deg, #080B1A 0%, #050812 100%)",
      }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "rgba(124,58,237,0.6)", borderTopColor: "transparent" }}
        />
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          Carregando…
        </p>
      </div>
    </div>
  );
}
