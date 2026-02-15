/**
 * Helpers para navegação com tenant
 */

import { addTenantToPath } from "./tenant";

/**
 * Cria um link com tenant preservado
 * @param tenant - Nome do tenant atual
 * @param path - Caminho relativo (ex: "/dashboard")
 * @returns Caminho completo com tenant
 */
export function createTenantLink(tenant: string | null, path: string): string {
  if (!tenant) {
    return path;
  }
  return addTenantToPath(tenant, path);
}

/**
 * Hook helper para usar em componentes client
 * Retorna uma função para criar links com tenant
 */
export function useTenantNavigation(tenant: string | null) {
  return (path: string) => createTenantLink(tenant, path);
}

