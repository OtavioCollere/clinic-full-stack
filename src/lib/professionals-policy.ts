import type { User } from "@/context/AuthContext";
import type { ClinicRoleType } from "@/lib/portal";

/**
 * Regras de permissão para a área de profissionais no dashboard.
 * Apenas OWNER e ADMIN podem criar/gerenciar profissionais.
 */
export const ProfessionalsPolicy = {
  canCreate(user: User | null | undefined): boolean {
    if (!user?.clinicRole) return false;
    const role = user.clinicRole as ClinicRoleType;
    return role === "OWNER" || role === "ADMIN";
  },
};
