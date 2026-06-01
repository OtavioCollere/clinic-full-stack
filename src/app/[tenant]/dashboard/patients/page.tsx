"use client";

import { useRouter } from "next/navigation";
import PatientsPageContent from "@/app/[tenant]/_components/patients-page-content";
import { useTenant } from "@/hooks/use-tenant";
import { createTenantLink } from "@/lib/tenant-navigation";

export default function PatientsManagement() {
  const router = useRouter();
  const tenant = useTenant();

  return (
    <PatientsPageContent
      portalBase="/dashboard"
      onPatientClick={(patient) =>
        router.push(createTenantLink(tenant, `/dashboard/patients/${patient.id}`))
      }
    />
  );
}
