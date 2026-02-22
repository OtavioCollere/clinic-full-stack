"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Stethoscope } from "lucide-react";
import { createTenantLink } from "@/lib/tenant-navigation";
import type { MenuItem } from "@/lib/portal";

interface SidebarProps {
  menuItems: MenuItem[];
  tenant: string | null;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ menuItems, tenant, isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-20"
      } bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col`}
    >
      <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
        {isOpen && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <span className="font-bold text-sidebar-foreground text-lg">Cliniker</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1 hover:bg-sidebar-accent rounded-md transition-colors text-sidebar-foreground"
          type="button"
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const tenantPath = createTenantLink(tenant, item.path);
          const isActive =
            pathname === tenantPath ||
            (tenantPath !== "/" && pathname?.startsWith(tenantPath + "/"));
          return (
            <Link key={item.path} href={tenantPath}>
              <button
                type="button"
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : isOpen
                    ? "text-sidebar-foreground hover:bg-sidebar-accent"
                    : "text-sidebar-foreground hover:bg-sidebar-accent justify-center"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {isOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
