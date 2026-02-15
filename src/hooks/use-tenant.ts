"use client";

import { useParams, usePathname } from "next/navigation";
import { extractTenantFromPath } from "@/lib/tenant";

/**
 * Hook para acessar o tenant atual da URL
 * @returns O tenant atual ou null se não houver
 */
export function useTenant(): string | null {
  const params = useParams();
  const pathname = usePathname();

  // Tenta pegar do params primeiro (se estiver em uma rota [tenant])
  if (params?.tenant && typeof params.tenant === "string") {
    return params.tenant;
  }

  // Se não estiver em uma rota [tenant], tenta extrair do pathname
  return extractTenantFromPath(pathname);
}

/**
 * Hook para obter informações completas do tenant
 */
export function useTenantInfo() {
  const tenant = useTenant();
  const pathname = usePathname();

  return {
    tenant,
    isTenantRoute: tenant !== null,
    currentPath: pathname,
  };
}

