"use client";

import { useState } from "react";
import { Bell, LogOut, Plus } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sidebar } from "./sidebar";
import type { MenuItem } from "@/lib/portal";
import Link from "next/link";
import { createTenantLink } from "@/lib/tenant-navigation";

interface AppLayoutProps {
  children: React.ReactNode;
  menuItems: MenuItem[];
  tenant: string | null;
  userName?: string | null;
  clinicName?: string;
}

function todayLabel(): string {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function AppLayout({ children, menuItems, tenant, userName }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { logout, user } = useAuthContext();

  const initials = (userName ?? "U")
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

  return (
    <div className="flex h-screen" style={{ background: "var(--page-bg)" }}>
      <Sidebar
        menuItems={menuItems}
        tenant={tenant}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header
          className="h-[52px] px-6 flex items-center gap-3 shrink-0"
          style={{
            background: "var(--page-bg)",
            borderBottom: "1px solid var(--border-w)",
          }}
        >
          {/* Date in serif italic */}
          <span
            className="flex-1 capitalize"
            style={{
              fontFamily: "var(--f-serif)",
              fontStyle: "italic",
              fontSize: 14,
              color: "var(--t2)",
            }}
          >
            {todayLabel()}
          </span>

          {/* Bell with amber dot */}
          <button
            type="button"
            className="relative flex items-center justify-center w-[34px] h-[34px] rounded-lg transition-colors"
            style={{ border: "1px solid var(--border-w)", background: "#fff", color: "var(--t2)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-s)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-w)";
            }}
          >
            <Bell className="w-[15px] h-[15px]" />
            <span
              className="absolute rounded-full"
              style={{
                top: 7,
                right: 8,
                width: 5,
                height: 5,
                background: "var(--amb)",
                border: "1.5px solid var(--page-bg)",
              }}
            />
          </button>

          {/* New appointment CTA */}
          {tenant && (
            <Link href={createTenantLink(tenant, "/dashboard/appointments")}>
              <button
                type="button"
                className="flex items-center gap-[5px] h-[34px] px-[14px] rounded-lg text-[13px] font-medium transition-colors"
                style={{ background: "var(--t1)", color: "#fff" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--acc-dk)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--t1)";
                }}
              >
                <Plus className="w-3 h-3" />
                Novo agendamento
              </button>
            </Link>
          )}

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="flex items-center gap-2 focus:outline-none">
                <div
                  className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-bold"
                  style={{ background: "var(--acc)", color: "#fff" }}
                >
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p
                    className="text-[12.5px] font-medium leading-tight"
                    style={{ color: "var(--t1)" }}
                  >
                    {userName ?? "Usuário"}
                  </p>
                  <p className="text-[10.5px] leading-tight" style={{ color: "var(--t3)" }}>
                    {user?.clinicRole ?? ""}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem asChild>
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500 cursor-pointer focus:text-red-500"
                onSelect={(e) => {
                  e.preventDefault();
                  logout();
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 overflow-y-auto p-8" style={{ background: "var(--page-bg)" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
