import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { extractTenantFromPath, isValidTenant } from "./src/lib/tenant";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Extrai o tenant da URL
  const tenant = extractTenantFromPath(pathname);

  // Se houver tenant na URL, valida
  if (tenant && !isValidTenant(tenant)) {
    return NextResponse.json(
      { error: "Invalid tenant name" },
      { status: 400 }
    );
  }

  return NextResponse.next();
}

export const config = {
  // Matcher para todas as rotas, exceto arquivos estáticos e API routes
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

