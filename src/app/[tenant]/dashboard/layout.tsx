import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardLayout from "./_components/dashboard-layout";
import { extractTenantFromPath, addTenantToPath } from "@/lib/tenant";

export default async function Layout({ 
  children,
  params 
}: { 
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");
  const headersList = await headers();
  const pathname = headersList.get("x-invoke-path") || "";

  if (!accessToken) {
    // Tenta pegar o tenant dos params ou do pathname
    const currentTenant = tenant || extractTenantFromPath(pathname);
    const loginPath = currentTenant ? addTenantToPath(currentTenant, "/auth/login") : "/auth/login";
    redirect(loginPath);
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}



