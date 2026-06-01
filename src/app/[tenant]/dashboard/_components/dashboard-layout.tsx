"use client";

import {
  Activity,
  Bell,
  Calendar,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  Syringe,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthContext } from "@/context/AuthContext";
import { useTenant } from "@/hooks/use-tenant";
import { createTenantLink } from "@/lib/tenant-navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Painel", path: "/dashboard" },
  { icon: Calendar, label: "Consultas", path: "/dashboard/appointments" },
  { icon: Users, label: "Pacientes", path: "/dashboard/patients" },
  { icon: UserCheck, label: "Profissionais", path: "/dashboard/professionals" },
  { icon: Activity, label: "Performance", path: "/dashboard/performance" },
  { icon: Syringe, label: "Procedimentos", path: "/dashboard/procedures" },
  { icon: Receipt, label: "Comandas", path: "/dashboard/billing" },
  { icon: TrendingUp, label: "Financeiro", path: "/dashboard/financial" },
];

const ACTIVE_COLOR = "#93c5fd";
const ACTIVE_BG = "rgba(96,165,250,0.14)";
const ACTIVE_BORDER = "#60a5fa";
const INACTIVE_TEXT = "rgba(229,237,249,0.86)";
const INACTIVE_ICON = "rgba(229,237,249,0.58)";
const LOGO_BG = "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)";

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthContext();
  const tenant = useTenant();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const firstName = user?.name?.split(" ")[0] ?? "Usuário";

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--page-bg)" }}
    >
      {/* ── Sidebar ── */}
      <aside
        className={`${collapsed ? "w-[64px]" : "w-[220px]"} flex flex-col flex-shrink-0 transition-all duration-200`}
        style={{
          background: "var(--sidebar-bg-with-glow)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Logo */}
        <div
          className={`h-16 flex items-center border-b flex-shrink-0 ${collapsed ? "justify-center px-0" : "px-5"}`}
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-[0_10px_24px_rgba(37,99,235,0.28)]"
              style={{ background: LOGO_BG }}
            >
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" />
                <path d="M12 8v8M8 12h8" />
              </svg>
            </div>
            {!collapsed && (
              <span className="font-bold text-white text-base truncate">
                Cliniker
              </span>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-4 flex flex-col gap-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const href = createTenantLink(tenant, item.path);
            const isRoot = item.path === "/dashboard";
            const current = pathname.replace(/\/$/, "");
            const base = href.replace(/\/$/, "");
            const isActive = isRoot
              ? current === base
              : current === base || current.startsWith(`${base}/`);

            return (
              <Link key={item.path} href={href}>
                <span
                  className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-100 ${
                    collapsed ? "justify-center" : ""
                  }`}
                  style={{
                    fontWeight: isActive ? 650 : 500,
                    color: isActive ? ACTIVE_COLOR : INACTIVE_TEXT,
                    background: isActive ? ACTIVE_BG : "transparent",
                  }}
                  title={collapsed ? item.label : undefined}
                >
                  {/* Left bar indicator */}
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r"
                      style={{ background: ACTIVE_BORDER }}
                    />
                  )}
                  <Icon
                    size={16}
                    className="flex-shrink-0"
                    style={{ color: isActive ? ACTIVE_COLOR : INACTIVE_ICON }}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div
          className="border-t p-2.5 space-y-1 flex-shrink-0"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          {/* Collapse toggle */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-sm ${
              collapsed ? "justify-center" : ""
            }`}
            style={{ color: "rgba(191,207,232,0.45)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.05)";
              (e.currentTarget as HTMLButtonElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
              (e.currentTarget as HTMLButtonElement).style.color =
                "rgba(191,207,232,0.45)";
            }}
          >
            {collapsed ? (
              <PanelLeftOpen size={16} />
            ) : (
              <>
                <PanelLeftClose size={16} />
                <span className="font-medium">Recolher</span>
              </>
            )}
          </button>

          {/* User */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
                  collapsed ? "justify-center" : ""
                }`}
                style={{ color: INACTIVE_TEXT }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
                }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.18)",
                  }}
                >
                  {initials}
                </div>
                {!collapsed && (
                  <>
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-[13px] font-semibold text-white truncate">
                        {user?.name ?? "Usuário"}
                      </div>
                      <div
                        className="text-xs truncate"
                        style={{ color: "rgba(229,237,249,0.56)" }}
                      >
                        Administrador
                      </div>
                    </div>
                    <ChevronDown
                      size={13}
                      className="flex-shrink-0 opacity-40"
                    />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-48 mb-1">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs font-medium text-foreground truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
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
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header
          className="h-16 flex items-center px-6 lg:px-8 gap-3 flex-shrink-0"
          style={{
            background: "var(--header-bg-gradient)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex-1 flex items-center gap-2 text-sm">
            <span className="font-semibold text-white">Clínica Principal</span>
            <span className="text-white/25">·</span>
            <span className="font-medium text-white/70">{firstName}</span>
          </div>
          <button
            type="button"
            className="relative p-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Bell size={17} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full border-2 border-[#080B1A] bg-blue-400" />
          </button>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold bg-white/10 border border-white/20">
            {initials}
          </div>
          <ChevronDown size={14} className="text-white/50" />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
