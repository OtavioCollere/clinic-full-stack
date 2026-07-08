"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ChevronsUpDown, Check, PanelLeftClose, PanelLeftOpen, Hospital } from "lucide-react";
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

const ACCENT = "#cb9849";
const ACCENT_SOFT = "#f5b85a";

function formatTenantName(slug: string | null): string {
  if (!slug) return "Clínica";
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function FranchiseSwitcher({ isOpen }: { isOpen: boolean }) {
  const { franchises, selected, setSelected, isLoading } = useFranchise();

  // No franchises (patient/professional portal or data not loaded yet)
  if (!isLoading && franchises.length === 0) {
    return (
      <div
        className={`flex items-center gap-3 rounded-xl ${isOpen ? "px-3.5 py-3" : "justify-center p-2.5"}`}
        style={{
          background: "linear-gradient(135deg, rgba(203,152,73,0.10), rgba(255,255,255,0.03))",
          border: "1px solid rgba(203,152,73,0.18)",
        }}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(203,152,73,0.2)" }}>
          <Hospital className="w-4 h-4" style={{ color: ACCENT_SOFT }} />
        </div>
        {isOpen && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white leading-tight">Cliniker</p>
            <p className="text-xs text-white/40 leading-tight mt-0.5">Gestão de clínicas</p>
          </div>
        )}
      </div>
    );
  }

  const cardContent = (
    <div
      className={`flex items-center gap-3 rounded-xl transition-all ${
        isOpen ? "px-3.5 py-3" : "justify-center p-2.5"
      }`}
      style={{
        background: "linear-gradient(135deg, rgba(203,152,73,0.14), rgba(255,255,255,0.04))",
        border: "1px solid rgba(203,152,73,0.22)",
      }}
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(203,152,73,0.2)" }}>
        <Hospital className="w-4 h-4" style={{ color: ACCENT_SOFT }} />
      </div>
      {isOpen && (
        <>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-white truncate leading-tight">
              {selected?.name ?? (isLoading ? "…" : "Franquia")}
            </p>
          </div>
          {franchises.length > 1 && (
            <ChevronsUpDown className="w-4 h-4 text-white/35 shrink-0" />
          )}
        </>
      )}
    </div>
  );

  if (franchises.length <= 1) return <div>{cardContent}</div>;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="w-full focus:outline-none">
          {cardContent}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        align="start"
        sideOffset={10}
        className="w-60 rounded-xl p-1"
      >
        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Franquias
        </div>
        <DropdownMenuSeparator />
        {franchises.map((f) => (
          <DropdownMenuItem
            key={f.id}
            onSelect={() => setSelected(f)}
            className="flex items-center gap-2.5 cursor-pointer rounded-lg px-2.5 py-2"
          >
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="w-3 h-3 text-primary" />
            </div>
            <span className="flex-1 text-[13px]">{f.name}</span>
            {selected?.id === f.id && (
              <Check className="w-3.5 h-3.5 text-primary shrink-0" />
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
      className={`${
        isOpen ? "w-72" : "w-[64px]"
      } transition-all duration-300 flex flex-col shrink-0`}
      style={{
        background: "var(--sidebar-bg-with-glow)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Clinic name / logo */}
      <div
        className={`shrink-0 ${isOpen ? "px-4 py-4" : "py-3 flex justify-center"}`}
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {isOpen ? (
          <p
            className="text-[15px] font-semibold text-white leading-tight truncate"
            title={formatTenantName(tenant)}
          >
            {formatTenantName(tenant)}
          </p>
        ) : (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[13px] font-bold"
            style={{ background: "rgba(203,152,73,0.25)" }}
            title={formatTenantName(tenant)}
          >
            {formatTenantName(tenant).charAt(0)}
          </div>
        )}
      </div>

      {/* Franchise switcher */}
      <div className={`shrink-0 pt-4 pb-3 ${isOpen ? "px-3" : "px-2"}`}>
        <FranchiseSwitcher isOpen={isOpen} />
      </div>

      <div
        className="shrink-0 mx-3 mb-2"
        style={{ height: "1px", background: "rgba(255,255,255,0.06)" }}
      />

      {/* Nav items */}
      <nav className={`flex-1 overflow-y-auto py-2 space-y-0.5 ${isOpen ? "px-2" : "px-2"}`}>
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
                className={`w-full flex items-center gap-3 py-2.5 text-[15px] transition-all duration-150 ${
                  isOpen ? "px-3" : "justify-center px-0"
                } ${!isActive ? "hover:text-white/90 hover:bg-white/[0.05]" : ""}`}
                style={
                  isActive
                    ? isOpen
                      ? {
                          borderLeft: `2.5px solid ${ACCENT}`,
                          background: "rgba(203,152,73,0.13)",
                          boxShadow: "inset 0 0 24px rgba(203,152,73,0.07)",
                          borderRadius: "0 10px 10px 0",
                          color: "#fff",
                          fontWeight: 600,
                          paddingLeft: "10px",
                        }
                      : {
                          background: "rgba(203,152,73,0.16)",
                          borderRadius: "10px",
                          color: "#fff",
                          fontWeight: 600,
                        }
                    : {
                        borderRadius: "8px",
                        color: "rgba(255,255,255,0.55)",
                      }
                }
              >
                <Icon
                  className="w-5 h-5 shrink-0 transition-colors"
                  style={{ color: isActive ? ACCENT_SOFT : undefined }}
                />
                {isOpen && <span>{item.label}</span>}
              </button>
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div
        className="shrink-0 mt-1 mb-3 flex items-center"
        style={{ padding: isOpen ? "0 8px" : "0 8px" }}
      >
        <div
          className="w-full"
          style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "10px" }}
        />
      </div>
      <div className={`shrink-0 mb-4 flex ${isOpen ? "justify-end px-3" : "justify-center px-0"}`}>
        <button
          onClick={onToggle}
          type="button"
          className="p-1.5 rounded-md text-white/35 hover:text-white/80 hover:bg-white/[0.06] transition-colors"
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        >
          {isOpen
            ? <PanelLeftClose className="w-4 h-4" />
            : <PanelLeftOpen className="w-4 h-4" />
          }
        </button>
      </div>
    </aside>
  );
}
