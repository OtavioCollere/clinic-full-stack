"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ChevronsUpDown, Check, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { createTenantLink } from "@/lib/tenant-navigation";
import type { MenuItem } from "@/lib/portal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFranchise } from "@/context/FranchiseContext";

interface SidebarProps {
  menuItems: MenuItem[];
  tenant: string | null;
  isOpen: boolean;
  onToggle: () => void;
}

function FranchiseSwitcher({ isOpen }: { isOpen: boolean }) {
  const { franchises, selected, setSelected, isLoading } = useFranchise();

  if (!isLoading && franchises.length === 0) {
    return (
      <div className={`flex items-center gap-2.5 ${isOpen ? "px-3 py-2.5" : "justify-center p-2"}`}>
        {isOpen && (
          <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--t3)" }}>
            Sem unidade
          </p>
        )}
      </div>
    );
  }

  const cardContent = (
    <div
      className={`flex items-center gap-2.5 rounded-lg transition-all ${
        isOpen ? "px-3 py-2.5" : "justify-center p-2"
      }`}
      style={{ background: "var(--acc-lt)", border: "1px solid var(--border-w)" }}
    >
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
        style={{ background: "var(--acc)", color: "#fff", fontSize: 11, fontWeight: 700 }}
      >
        {(selected?.name ?? "C").charAt(0).toUpperCase()}
      </div>
      {isOpen && (
        <>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[13px] font-semibold truncate leading-tight" style={{ color: "var(--t1)" }}>
              {selected?.name ?? (isLoading ? "…" : "Franquia")}
            </p>
          </div>
          {franchises.length > 1 && (
            <ChevronsUpDown className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--t3)" }} />
          )}
        </>
      )}
    </div>
  );

  if (franchises.length <= 1) return <div>{cardContent}</div>;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="w-full focus:outline-none">{cardContent}</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" sideOffset={10} className="w-56 rounded-xl p-1">
        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Unidades
        </div>
        <DropdownMenuSeparator />
        {franchises.map((f) => (
          <DropdownMenuItem
            key={f.id}
            onSelect={() => setSelected(f)}
            className="flex items-center gap-2.5 cursor-pointer rounded-lg px-2.5 py-2"
          >
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
              style={{ background: "var(--acc-lt)" }}
            >
              <Building2 className="w-3 h-3" style={{ color: "var(--acc-dk)" }} />
            </div>
            <span className="flex-1 text-[13px]">{f.name}</span>
            {selected?.id === f.id && (
              <Check className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--grn)" }} />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Sidebar({ menuItems, tenant, isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`${isOpen ? "w-[218px]" : "w-[60px]"} transition-all duration-300 flex flex-col shrink-0`}
      style={{
        background: "var(--sidebar-bg-base)",
        borderRight: "1px solid var(--border-w)",
      }}
    >
      {/* Logo */}
      <div
        className={`shrink-0 ${isOpen ? "px-[22px] py-6" : "px-2 py-5 flex justify-center"}`}
        style={{ borderBottom: "1px solid var(--border-w)" }}
      >
        {isOpen ? (
          <>
            <div
              style={{
                fontFamily: "var(--f-serif)",
                fontStyle: "italic",
                fontSize: 21,
                color: "var(--acc-dk)",
                letterSpacing: -0.3,
                lineHeight: 1,
              }}
            >
              bianca
            </div>
            <span
              style={{
                display: "block",
                fontSize: 9.5,
                textTransform: "uppercase",
                letterSpacing: 2,
                color: "var(--t3)",
                marginTop: 5,
              }}
            >
              estética médica
            </span>
          </>
        ) : (
          <div
            style={{
              fontFamily: "var(--f-serif)",
              fontStyle: "italic",
              fontSize: 17,
              color: "var(--acc-dk)",
              lineHeight: 1,
            }}
          >
            b
          </div>
        )}
      </div>

      {/* Franchise switcher */}
      <div className={`shrink-0 pt-3 pb-2 ${isOpen ? "px-3" : "px-2"}`}>
        <FranchiseSwitcher isOpen={isOpen} />
      </div>

      <div className="shrink-0 mx-3" style={{ height: 1, background: "var(--border-w)" }} />

      {/* Nav items */}
      <nav className={`flex-1 overflow-y-auto py-2 space-y-px ${isOpen ? "px-[10px]" : "px-2"}`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const tenantPath = createTenantLink(tenant, item.path);
          const isActive =
            pathname === tenantPath ||
            (tenantPath !== "/" &&
              pathname?.startsWith(tenantPath + "/") &&
              !menuItems.some((other) => {
                if (other.path === item.path) return false;
                const otherPath = createTenantLink(tenant, other.path);
                return (
                  pathname === otherPath ||
                  (otherPath !== "/" && pathname?.startsWith(otherPath + "/"))
                );
              }));

          return (
            <Link key={item.path} href={tenantPath}>
              <button
                type="button"
                title={!isOpen ? item.label : undefined}
                className={`w-full flex items-center gap-[9px] py-2 text-[13.5px] transition-all duration-150 rounded-lg ${
                  isOpen ? "px-3" : "justify-center px-0"
                }`}
                style={
                  isActive
                    ? { background: "var(--acc-lt)", color: "var(--acc-dk)", fontWeight: 550 }
                    : { color: "var(--t2)" }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--border-w)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--t1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = "";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--t2)";
                  }
                }}
              >
                <Icon
                  className="w-4 h-4 shrink-0"
                  style={{ color: isActive ? "var(--acc-dk)" : "var(--t3)" }}
                />
                {isOpen && <span>{item.label}</span>}
              </button>
            </Link>
          );
        })}
      </nav>

      {/* Toggle */}
      <div className="shrink-0 mb-3" style={{ borderTop: "1px solid var(--border-w)", paddingTop: 10 }}>
        <div className={`flex ${isOpen ? "justify-end px-3" : "justify-center"}`}>
          <button
            onClick={onToggle}
            type="button"
            className="p-1.5 rounded-md transition-colors"
            style={{ color: "var(--t3)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "var(--t1)";
              (e.currentTarget as HTMLButtonElement).style.background = "var(--border-w)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "var(--t3)";
              (e.currentTarget as HTMLButtonElement).style.background = "";
            }}
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
