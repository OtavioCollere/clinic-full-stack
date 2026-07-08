"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { useTenant } from "@/hooks/use-tenant";
import { addTenantToPath } from "@/lib/tenant";
import { getPortalBaseForRole, type ClinicRoleType } from "@/lib/portal";

/**
 * Entry point after login: redirects to the correct portal based on user.clinicRole.
 * Protected by middleware (must have valid token to reach here).
 */
export default function HomePage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const tenant = useTenant();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const loginPath = tenant ? addTenantToPath(tenant, "/auth/login") : "/auth/login";
      router.replace(loginPath);
      return;
    }
    const role = (user.clinicRole ?? "PATIENT") as ClinicRoleType;
    const portalBase = getPortalBaseForRole(role);
    const redirectPath = tenant ? addTenantToPath(tenant, portalBase) : portalBase;
    router.replace(redirectPath);
  }, [user, loading, tenant, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-muted-foreground">Redirecionando...</div>
    </div>
  );
}
