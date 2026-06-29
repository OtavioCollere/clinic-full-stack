"use client";

import { useState } from "react";
import { Bell, LogOut, ChevronDown } from "lucide-react";
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

interface AppLayoutProps {
  children: React.ReactNode;
  menuItems: MenuItem[];
  tenant: string | null;
  userName?: string | null;
  clinicName?: string;
}

export function AppLayout({ children, menuItems, tenant, userName, clinicName }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { logout } = useAuthContext();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        menuItems={menuItems}
        tenant={tenant}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header
          className="h-14 px-6 flex items-center justify-between shrink-0 border-b border-white/[0.08]"
          style={{ background: "var(--header-bg-gradient)" }}
        >
          <div>
            <p className="text-base font-semibold text-white leading-tight">
              {clinicName ?? "Cliniker"}
            </p>
            <p className="text-[13px] text-white/50">
              {userName ?? "Usuário"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full border border-[#080B1A]" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {userName?.charAt(0).toUpperCase() ?? "U"}
                  </div>
                  <span className="hidden sm:block text-[15px] text-white font-medium">
                    {userName ?? "Usuário"}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-400 cursor-pointer focus:text-red-400"
                  onSelect={(e) => {
                    e.preventDefault();
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

        <main className="flex-1 overflow-y-auto p-8" style={{ background: "var(--page-bg)" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
