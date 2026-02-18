/**
 * Utilitários para trabalhar com tenant na URL
 */

/**
 * Extrai o tenant da URL atual
 * @param pathname - Pathname da URL (ex: "/clinicatakaki/auth/login")
 * @returns O tenant ou null se não encontrado
 */
export function extractTenantFromPath(pathname: string): string | null {
  // Remove a barra inicial e pega o primeiro segmento
  const segments = pathname.split("/").filter(Boolean);
  
  // Se não houver segmentos, não há tenant
  if (segments.length === 0) {
    return null;
  }

  // Lista de rotas públicas que não são tenants
  const publicRoutes = ["auth", "api", "_next", "favicon.ico"];
  
  const firstSegment = segments[0];
  
  // Se o primeiro segmento for uma rota pública, não é tenant
  if (publicRoutes.includes(firstSegment)) {
    return null;
  }

  return firstSegment;
}

/**
 * Remove o tenant do pathname para obter a rota relativa
 * @param pathname - Pathname completo (ex: "/clinicatakaki/auth/login")
 * @returns Rota relativa sem o tenant (ex: "/auth/login")
 */
export function removeTenantFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  
  if (segments.length === 0) {
    return "/";
  }

  const tenant = extractTenantFromPath(pathname);
  
  if (!tenant) {
    return pathname;
  }

  // Remove o tenant e reconstrói o path
  const routeSegments = segments.slice(1);
  return routeSegments.length > 0 ? `/${routeSegments.join("/")}` : "/";
}

/**
 * Adiciona o tenant ao path
 * @param tenant - Nome do tenant
 * @param path - Caminho relativo (ex: "/auth/login")
 * @returns Caminho completo com tenant (ex: "/clinicatakaki/auth/login")
 */
export function addTenantToPath(tenant: string, path: string): string {
  // Garante que o path comece com /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  
  // Remove / do início do tenant se houver
  const normalizedTenant = tenant.startsWith("/") ? tenant.slice(1) : tenant;
  
  return `/${normalizedTenant}${normalizedPath}`;
}

/**
 * Valida se um tenant é válido (pode adicionar lógica de validação aqui)
 * @param tenant - Nome do tenant
 * @returns true se o tenant é válido
 */
export function isValidTenant(tenant: string): boolean {
  // Validação básica: apenas letras, números, hífens e underscores
  // Mínimo de 3 caracteres, máximo de 50
  const tenantRegex = /^[a-zA-Z0-9_-]{3,50}$/;
  return tenantRegex.test(tenant);
}





