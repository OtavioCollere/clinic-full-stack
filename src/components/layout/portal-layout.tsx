"use client";

import { AppLayout } from "./app-layout";
import { ProtectedRoute } from "./protected-route";
import AnamnesisGate from "@/app/[tenant]/_components/anamnese-gate";
import { getMenuByRole, type ClinicRoleType, type PortalSegment } from "@/lib/portal";
import { useAuthContext } from "@/context/AuthContext";
import { useTenant } from "@/hooks/use-tenant";
import { FranchiseProvider } from "@/context/FranchiseContext";

interface PortalLayoutProps {
  children: React.ReactNode;
  portal: PortalSegment;
}

/**
 * Single layout for all portals: enforces auth + role for the given portal,
 * then renders shared AppLayout with role-based menu.
 */
export function PortalLayout({ children, portal }: PortalLayoutProps) {
  const tenant = useTenant();

  return (
    <ProtectedRoute portal={portal}>
      <PortalLayoutInner portal={portal} tenant={tenant}>
        {children}
      </PortalLayoutInner>
    </ProtectedRoute>
  );
}

function PortalLayoutInner({
  children,
  portal,
  tenant,
}: {
  children: React.ReactNode;
  portal: PortalSegment;
  tenant: string | null;
}) {
  const { user } = useAuthContext();
  const role = (user?.clinicRole ?? "PATIENT") as ClinicRoleType;
  const menuItems = getMenuByRole(role);

  return (
    <FranchiseProvider clinicId={user?.clinicId ?? null}>
      <AppLayout
        menuItems={menuItems}
        tenant={tenant}
        userName={user?.name ?? null}
        clinicName={undefined}
      >
        {portal === "patient" && <AnamnesisGate isOpen={true} />}
        {children}
      </AppLayout>
    </FranchiseProvider>
  );
}
