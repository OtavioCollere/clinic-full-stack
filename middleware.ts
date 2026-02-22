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

  // Remove o tenant do pathname para verificar rotas protegidas
  const routeWithoutTenant = tenant
    ? pathname.replace(`/${tenant}`, "") || "/"
    : pathname;

  const isProtectedRoute =
    routeWithoutTenant.startsWith("/dashboard") ||
    routeWithoutTenant.startsWith("/professional") ||
    routeWithoutTenant.startsWith("/patient") ||
    routeWithoutTenant.startsWith("/home");

  if (isProtectedRoute) {
    const accessToken = request.cookies.get("access_token");

    if (!accessToken) {
      const loginPath = tenant
        ? `/${tenant}/auth/login`
        : "/auth/login";
      return NextResponse.redirect(new URL(loginPath, request.url));
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
      const cookieHeader = request.headers.get("cookie") || "";
      const headers: HeadersInit = { Cookie: cookieHeader };
      if (tenant) {
        headers["X-Tenant-ID"] = tenant;
      }

      const response = await fetch(`${apiUrl}/users/me`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (!response.ok || response.status === 401) {
        const loginPath = tenant
          ? `/${tenant}/auth/login`
          : "/auth/login";
        return NextResponse.redirect(new URL(loginPath, request.url));
      }

      const data = await response.json();
      if (!data?.user?.id) {
        const loginPath = tenant
          ? `/${tenant}/auth/login`
          : "/auth/login";
        return NextResponse.redirect(new URL(loginPath, request.url));
      }
    } catch (error) {
      const loginPath = tenant
        ? `/${tenant}/auth/login`
        : "/auth/login";
      return NextResponse.redirect(new URL(loginPath, request.url));
    }
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

