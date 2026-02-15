"use client"

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTenant } from "@/hooks/use-tenant";
import { createTenantLink } from "@/lib/tenant-navigation";
import {
  Menu,
  X,
  Stethoscope,
  LayoutDashboard,
  Calendar,
  Users,
  Pill,
  UserCheck,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthContext } from "@/context/AuthContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { user, logout } = useAuthContext();
  const tenant = useTenant();

  const menuItems = [
    { icon: LayoutDashboard, label: "Painel", path: "/dashboard" },
    { icon: Calendar, label: "Consultas", path: "/dashboard/appointments" },
    { icon: Users, label: "Pacientes", path: "/dashboard/patients" },
    { icon: UserCheck, label: "Profissionais", path: "/dashboard/professionals" },
    { icon: Pill, label: "Procedimentos", path: "/dashboard/procedures" },
    { icon: Pill, label: "Faturamento", path: "/dashboard/billing" },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
              <span className="font-bold text-sidebar-foreground text-lg">Cliniker</span>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-sidebar-accent rounded-md transition-colors text-sidebar-foreground"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const tenantPath = createTenantLink(tenant, item.path);
            const isActive = pathname === item.path || pathname === tenantPath;
            return (
              <Link key={item.path} href={tenantPath}>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : isSidebarOpen
                      ? "text-sidebar-foreground hover:bg-sidebar-accent"
                      : "text-sidebar-foreground hover:bg-sidebar-accent justify-center"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-border h-16 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-foreground" />
              </button>
            )}
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Nome da Clínica
              </h1>
              <p className="text-sm text-muted-foreground">
                Bem-vindo de volta, {user?.name || "Usuário"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-foreground" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 px-3 py-2 hover:bg-secondary rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {user?.name || "Usuário"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 cursor-pointer focus:text-red-600"
                  onSelect={(e) => {
                    e.preventDefault();
                    console.log("🔘 Botão Sair clicado!");
                    logout();
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
