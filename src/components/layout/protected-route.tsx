"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { useTenant } from "@/hooks/use-tenant";
import { addTenantToPath } from "@/lib/tenant";
import {
  getPortalSegmentFromPath,
  canAccessPortal,
  getPortalBaseForRole,
  type ClinicRoleType,
  type PortalSegment,
} from "@/lib/portal";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Portal segment this route belongs to; used to enforce role access */
  portal: PortalSegment;
}

/**
 * Validates: 1) user is logged in, 2) user's role can access this portal.
 * Tenant is validated by the backend when fetchMe is called with X-Tenant-ID (from URL).
 * If user doesn't belong to tenant, fetchMe fails and user is null -> redirect to login.
 */
export function ProtectedRoute({ children, portal }: ProtectedRouteProps) {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const tenant = useTenant();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      const loginPath = tenant ? addTenantToPath(tenant, "/auth/login") : "/auth/login";
      router.replace(loginPath);
      return;
    }

    // Usuário autenticado mas sem clínica vinculada → precisa criar a clínica
    if (!user.clinicId && !pathname?.includes("/clinic/")) {
      const createClinicPath = tenant ? addTenantToPath(tenant, "/clinic/create") : "/clinic/create";
      router.replace(createClinicPath);
      return;
    }

    // Owner/Admin com clínica mas sem franquia → precisa criar a primeira franquia
    const isStaff = user.clinicRole === "OWNER" || user.clinicRole === "ADMIN";
    if (isStaff && user.clinicId && user.hasFranchise === false && !pathname?.includes("/franchise/")) {
      const createFranchisePath = tenant ? addTenantToPath(tenant, "/franchise/create") : "/franchise/create";
      router.replace(createFranchisePath);
      return;
    }

    const role = (user.clinicRole ?? "PATIENT") as ClinicRoleType;
    if (!canAccessPortal(role, portal)) {
      const correctBase = getPortalBaseForRole(role);
      const redirectPath = tenant ? addTenantToPath(tenant, correctBase) : correctBase;
      router.replace(redirectPath);
    }
  }, [user, loading, portal, tenant, router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const role = (user.clinicRole ?? "PATIENT") as ClinicRoleType;
  if (!canAccessPortal(role, portal)) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Hook to get current portal from pathname (for use in layouts that need to know portal).
 */
export function useCurrentPortal(): PortalSegment | null {
  const pathname = usePathname();
  const tenant = useTenant();
  if (!pathname) return null;
  const withoutTenant = tenant ? pathname.replace(new RegExp(`^/${tenant}`), "") || "/" : pathname;
  return getPortalSegmentFromPath(withoutTenant);
}
