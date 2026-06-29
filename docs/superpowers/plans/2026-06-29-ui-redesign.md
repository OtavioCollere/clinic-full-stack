# UI Redesign — Bianca Estética Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o visual escuro/roxo atual por uma identidade caramelo/warm-white premium, aplicando o redesign (produzido em artifact HTML) diretamente no Next.js.

**Architecture:** Alterações puramente visuais — mesma estrutura de componentes, mesmos dados, mesma lógica de auth/routing. Muda: tokens CSS globais, sidebar (escuro → claro), topbar (escuro → claro), e a aba Geral do dashboard (hero card dark + stats + agenda + painel direito).

**Tech Stack:** Next.js 16 App Router, Tailwind CSS 4, shadcn/ui, React 19, TypeScript strict, Biome linter.

## Global Constraints

- TypeScript strict: sem `any`
- Biome como linter/formatter — não usar ESLint/Prettier
- Paleta exclusiva: sem azuis genéricos, sem roxo `#7C3AED`
- Fonte serif: `'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif` — apenas via `style={}` ou variável CSS, sem CDN
- Tailwind: usar valores arbitrários `[]` para cores do novo sistema quando necessário
- Sem novos pacotes de dependência
- Sem testes no frontend (inexistentes hoje)
- pnpm como package manager

---

## File Map

| Arquivo | O que muda |
|---|---|
| `src/app/globals.css` | Tokens CSS: paleta caramelo, sidebar claro, sem roxo |
| `src/components/layout/sidebar.tsx` | Dark navy → warm gray claro; logo em Palatino itálico |
| `src/components/layout/app-layout.tsx` | Topbar escuro → claro; data em serif; botão near-black |
| `src/app/[tenant]/dashboard/_components/general-tab.tsx` | Hero card dark + stats + agenda + painel direito |

---

## Task 1 — Commit backend (saas-clinic) na branch mvp/billing

**Files:**
- Todos os arquivos modificados/untracked em `saas-clinic/`

- [ ] **Step 1: Stagear e commitar o backend**

```bash
cd c:\dev\repository\bianca\saas-clinic
git add .
git commit -m "feat: service orders, professional patients, APP_URL env fix"
```

Expected: commit criado na branch `mvp/billing`.

---

## Task 2 — Commit frontend (clinic-full-stack) na branch mvp/billing

**Files:**
- Todos os arquivos modificados/untracked em `clinic-full-stack/`

- [ ] **Step 1: Stagear e commitar o frontend funcional**

```bash
cd c:\dev\repository\bianca\clinic-full-stack
git add .
git commit -m "feat: comandas page, professional patients, auth 404 fix"
```

Expected: commit criado na branch `mvp/billing`.

---

## Task 3 — Criar branch feature/ui-redesign no frontend

**Files:** nenhum arquivo alterado nesta task.

- [ ] **Step 1: Criar e mudar para a nova branch**

```bash
cd c:\dev\repository\bianca\clinic-full-stack
git checkout -b feature/ui-redesign
```

Expected: `Switched to a new branch 'feature/ui-redesign'`

- [ ] **Step 2: Verificar branch ativa**

```bash
git branch --show-current
```

Expected: `feature/ui-redesign`

---

## Task 4 — Design tokens: atualizar globals.css

**Files:**
- Modify: `src/app/globals.css`

**Paleta nova (tokens):**

| Token | Valor antigo | Valor novo |
|---|---|---|
| `--background` | `#f4f5f7` | `#FAFAF8` |
| `--border` | `rgba(0,0,0,0.08)` | `#E8E2D9` |
| `--primary` | `#7c3aed` (roxo) | `#1A1714` |
| `--sidebar-bg-*` | dark navy | warm gray claro |
| `--page-bg` | `#f4f5f7` | `#FAFAF8` |

- [ ] **Step 1: Substituir o bloco `:root` e os tokens de sidebar em globals.css**

Substituir o conteúdo do arquivo a partir de `:root {` até o fechamento `}` que contém `--page-bg` pelo seguinte:

```css
:root {
  --radius: 0.5rem;

  /* ── Paleta clínica ── */
  --acc:      #C09E75;   /* caramelo — identidade */
  --acc-dk:   #8C6B46;   /* caramelo escuro */
  --acc-lt:   #F4EDE3;   /* caramelo claro */
  --grn:      #3D6B4F;   /* verde semântico */
  --grn-lt:   #E8F0EB;
  --amb:      #B87B2C;   /* âmbar — atenção */
  --amb-lt:   #FBF0E3;
  --red-cl:   #9B4545;
  --red-lt:   #F9EAEA;
  --t1:       #1A1714;   /* near-black */
  --t2:       #6A5D52;
  --t3:       #9C8E83;
  --border-w: #E8E2D9;   /* borda warm */
  --border-s: #CFC8BC;   /* borda strong */
  --f-serif:  'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif;

  /* ── Sidebar (agora claro) ── */
  --sidebar-bg-base:      #F3F0EC;
  --sidebar-bg-deep:      #EDE8E0;
  --sidebar-glow-color:   rgba(192, 158, 117, 0.08);
  --sidebar-bg-with-glow: var(--sidebar-bg-base);

  /* ── Header ── */
  --header-bg-gradient: #FAFAF8;
  --header-glow: none;

  /* ── Brand ── */
  --brand-primary:       #1A1714;
  --brand-primary-hover: #8C6B46;
  --brand-accent:        #C09E75;
  --brand-accent-glow:   rgba(192, 158, 117, 0.15);

  /* ── shadcn tokens ── */
  --background:           #FAFAF8;
  --foreground:           #1A1714;
  --card:                 #FFFFFF;
  --card-foreground:      #1A1714;
  --popover:              #FFFFFF;
  --popover-foreground:   #1A1714;
  --primary:              var(--brand-primary);
  --primary-foreground:   #FFFFFF;
  --secondary:            #F3F0EC;
  --secondary-foreground: #1A1714;
  --muted:                #F3F0EC;
  --muted-foreground:     #9C8E83;
  --accent:               #F4EDE3;
  --accent-foreground:    #8C6B46;
  --destructive:          oklch(0.577 0.245 27.325);
  --border:               #E8E2D9;
  --input:                #E8E2D9;
  --ring:                 #C09E75;
  --chart-1:              #C09E75;
  --chart-2:              #3D6B4F;
  --chart-3:              #B87B2C;
  --chart-4:              #6A5D52;
  --chart-5:              #9C8E83;

  /* ── Sidebar tokens (shadcn) ── */
  --sidebar:                    var(--sidebar-bg-base);
  --sidebar-foreground:         #1A1714;
  --sidebar-primary:            #C09E75;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent:             #F4EDE3;
  --sidebar-accent-foreground:  #8C6B46;
  --sidebar-border:             #E8E2D9;
  --sidebar-ring:               #C09E75;

  --page-bg: #FAFAF8;
}
```

- [ ] **Step 2: Verificar que o arquivo compila (sem erros de build)**

```bash
cd c:\dev\repository\bianca\clinic-full-stack
pnpm build 2>&1 | tail -5
```

Expected: sem erros TypeScript (pode ter avisos pré-existentes, mas não novos erros).

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "style: replace purple/dark tokens with warm caramel palette"
```

---

## Task 5 — Sidebar: dark navy → warm gray claro

**Files:**
- Modify: `src/components/layout/sidebar.tsx`

A sidebar muda de dark (fundo `#080b1a`, texto branco) para light (fundo `#F3F0EC`, texto near-black). O logo passa a ser "bianca" em Palatino itálico caramelo escuro + "estética médica" em caixa alta espaçado abaixo.

- [ ] **Step 1: Reescrever sidebar.tsx**

```tsx
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
            <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: "var(--acc-lt)" }}>
              <Building2 className="w-3 h-3" style={{ color: "var(--acc-dk)" }} />
            </div>
            <span className="flex-1 text-[13px]">{f.name}</span>
            {selected?.id === f.id && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--grn)" }} />}
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
            <div style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 21, color: "var(--acc-dk)", letterSpacing: -0.3, lineHeight: 1 }}>
              bianca
            </div>
            <span style={{ display: "block", fontSize: 9.5, textTransform: "uppercase", letterSpacing: 2, color: "var(--t3)", marginTop: 5 }}>
              estética médica
            </span>
          </>
        ) : (
          <div style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 17, color: "var(--acc-dk)", lineHeight: 1 }}>
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
                return pathname === otherPath || (otherPath !== "/" && pathname?.startsWith(otherPath + "/"));
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
                  style={{ color: isActive ? "var(--acc-dk)" : "var(--t3)", opacity: isActive ? 1 : 0.8 }}
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
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--t1)"; (e.currentTarget as HTMLButtonElement).style.background = "var(--border-w)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--t3)"; (e.currentTarget as HTMLButtonElement).style.background = ""; }}
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd c:\dev\repository\bianca\clinic-full-stack
pnpm tsc --noEmit 2>&1 | grep -v "node_modules" | head -20
```

Expected: sem novos erros (erros pré-existentes são ignorados).

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/sidebar.tsx
git commit -m "style: sidebar dark-to-light with Palatino logo and caramel accent"
```

---

## Task 6 — App layout / topbar: escuro → claro

**Files:**
- Modify: `src/components/layout/app-layout.tsx`

A topbar passa a ser clara (canvas `#FAFAF8`): data atual em serif itálico à esquerda, sino com ponto âmbar, botão "Novo agendamento" near-black. O avatar do usuário fica caramelo.

- [ ] **Step 1: Reescrever app-layout.tsx**

```tsx
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
          <span style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 14, color: "var(--t2)", flex: 1 }}>
            {todayLabel()}
          </span>

          {/* Bell */}
          <button
            type="button"
            className="relative flex items-center justify-center w-[34px] h-[34px] rounded-lg transition-colors"
            style={{ border: "1px solid var(--border-w)", background: "#fff", color: "var(--t2)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-s)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-w)"; }}
          >
            <Bell className="w-[15px] h-[15px]" />
            <span
              className="absolute rounded-full"
              style={{ top: 7, right: 8, width: 5, height: 5, background: "var(--amb)", border: "1.5px solid var(--page-bg)" }}
            />
          </button>

          {/* New appointment */}
          {tenant && (
            <Link href={createTenantLink(tenant, "/dashboard/appointments")}>
              <button
                type="button"
                className="flex items-center gap-[5px] h-[34px] px-[14px] rounded-lg text-[13px] font-medium transition-colors"
                style={{ background: "var(--t1)", color: "#fff" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--acc-dk)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--t1)"; }}
              >
                <Plus className="w-3 h-3" />
                Novo agendamento
              </button>
            </Link>
          )}

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 focus:outline-none"
              >
                <div
                  className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-bold"
                  style={{ background: "var(--acc)", color: "#fff" }}
                >
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-[12.5px] font-medium leading-tight" style={{ color: "var(--t1)" }}>
                    {userName ?? "Usuário"}
                  </p>
                  <p className="text-[10.5px] leading-tight" style={{ color: "var(--t3)" }}>
                    {user?.clinicRole ?? ""}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem asChild><span>Perfil</span></DropdownMenuItem>
              <DropdownMenuItem asChild><span>Configurações</span></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500 cursor-pointer focus:text-red-500"
                onSelect={(e) => { e.preventDefault(); logout(); }}
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
```

- [ ] **Step 2: Verificar TypeScript**

```bash
pnpm tsc --noEmit 2>&1 | grep -v "node_modules" | grep "error TS" | head -10
```

Expected: sem novos erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/app-layout.tsx
git commit -m "style: light topbar with serif date, amber bell, near-black CTA"
```

---

## Task 7 — Dashboard Geral: hero card + stats + agenda + painel direito

**Files:**
- Modify: `src/app/[tenant]/dashboard/_components/general-tab.tsx`

O `GeneralTab` passa a mostrar:
1. **Hero card** — appointment mais próximo do horário atual (do histórico), fundo `#1A1714`, horário em Palatino itálico caramelo
2. **Stats row** — 4 cards: faturamento, consultas, pendências, retornos (fonte `getDashboardStats`)
3. **Agenda** — appointments de hoje filtrados do histórico
4. **Painel direito** — ações rápidas reformatadas

A lógica de dados não muda: `getDashboardStats` e `getAppointmentHistoryByClinicId` continuam sendo chamados.

- [ ] **Step 1: Reescrever general-tab.tsx**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Calendar, Users, UserCheck } from "lucide-react";
import Link from "next/link";
import { useAuthContext } from "@/context/AuthContext";
import { useTenant } from "@/hooks/use-tenant";
import { createTenantLink } from "@/lib/tenant-navigation";
import {
  type Appointment,
  getAppointmentHistoryByClinicId,
} from "@/services/appointments/appointment.service";
import {
  type DashboardStats,
  getDashboardStats,
} from "@/services/clinic/clinic.service";

/* ─── helpers ─── */
function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function fmtBRL(value: number | undefined) {
  if (value === undefined) return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}

function useAnimatedCount(target: number, duration = 900, delay = 0) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current || target === 0) return;
    started.current = true;
    const timer = setTimeout(() => {
      const start = Date.now();
      const tick = () => {
        const p = Math.min((Date.now() - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(Math.round(eased * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, duration, delay]);
  return value;
}

/* ─── status pill ─── */
const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  DONE:      { label: "Realizado",   bg: "var(--border-w)",  color: "var(--t3)" },
  CONFIRMED: { label: "Confirmado",  bg: "var(--grn-lt)",    color: "var(--grn)" },
  PENDING:   { label: "Aguardando",  bg: "var(--amb-lt)",    color: "var(--amb)" },
  CANCELLED: { label: "Cancelado",   bg: "var(--red-lt)",    color: "var(--red-cl)" },
  IN_PROGRESS:{ label: "Em atend.", bg: "var(--grn-lt)",    color: "var(--grn)" },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.PENDING;
  return (
    <span
      className="text-[10.5px] font-semibold px-[9px] py-[2px] rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

/* ─── main ─── */
export default function GeneralTab() {
  const { user } = useAuthContext();
  const tenant = useTenant();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.clinicId) return;
    Promise.all([
      getDashboardStats(user.clinicId),
      getAppointmentHistoryByClinicId(user.clinicId, 1, 50),
    ])
      .then(([s, appts]) => {
        setStats(s);
        setAppointments(Array.isArray(appts) ? appts : (appts as { appointments?: Appointment[] }).appointments ?? []);
      })
      .finally(() => setLoading(false));
  }, [user?.clinicId]);

  /* today's appointments */
  const today = todayIso();
  const todayAppts = appointments
    .filter((a) => a.date?.slice(0, 10) === today || a.scheduledAt?.slice(0, 10) === today)
    .sort((a, b) => {
      const ta = a.scheduledAt ?? a.date ?? "";
      const tb = b.scheduledAt ?? b.date ?? "";
      return ta.localeCompare(tb);
    });

  /* hero: first appointment of today or first upcoming */
  const now = new Date();
  const hero = todayAppts.find((a) => {
    const t = new Date(a.scheduledAt ?? a.date ?? "");
    return t >= now;
  }) ?? todayAppts[0];

  /* animated stat counters */
  const statRev  = useAnimatedCount(stats?.totalRevenue ?? 0, 950, 200);
  const statAppt = useAnimatedCount(stats?.totalAppointments ?? 0, 800, 350);
  const statPat  = useAnimatedCount(stats?.totalPatients ?? 0, 850, 400);
  const statProf = useAnimatedCount(stats?.totalProfessionals ?? 0, 700, 450);

  const quickActions = [
    { icon: Calendar,  label: "Nova Consulta", path: "/dashboard/appointments" },
    { icon: Users,     label: "Novo Paciente",  path: "/dashboard/patients" },
    { icon: UserCheck, label: "Profissionais",  path: "/dashboard/professionals" },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {/* hero skeleton */}
        <div className="rounded-2xl animate-pulse h-[104px]" style={{ background: "#2A2520" }} />
        {/* stats skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4].map((k) => (
            <div key={k} className="bg-card rounded-xl border h-[96px] animate-pulse" style={{ borderColor: "var(--border-w)" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── HERO ── */}
      {hero ? (
        <section
          className="rounded-2xl px-6 py-5 flex items-center gap-5 relative overflow-hidden"
          style={{ background: "var(--t1)" }}
        >
          {/* subtle caramel glow */}
          <div
            className="absolute right-0 top-0 w-72 h-full pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 80% 50%, rgba(192,158,117,.14) 0%, transparent 65%)" }}
          />

          {/* time block */}
          <div className="shrink-0 flex flex-col items-center gap-1.5">
            <span className="text-[9.5px] uppercase tracking-[1.2px]" style={{ color: "rgba(255,255,255,.32)" }}>
              {(hero.status ?? "PENDING") === "IN_PROGRESS" ? "Em atendimento" : "Próximo"}
            </span>
            <span style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 38, color: "var(--acc)", letterSpacing: -1.5, lineHeight: 1 }}>
              {fmtTime(hero.scheduledAt ?? hero.date ?? "")}
            </span>
            {(hero.status ?? "") === "IN_PROGRESS" && (
              <span className="flex items-center gap-1 text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "rgba(61,107,79,.25)", color: "#7EC99A" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#7EC99A] animate-pulse" />
                Ao vivo
              </span>
            )}
          </div>

          <div className="w-px h-14 shrink-0" style={{ background: "rgba(255,255,255,.09)" }} />

          {/* info */}
          <div className="flex-1 min-w-0">
            <p className="text-[19px] font-semibold leading-tight" style={{ color: "#fff" }}>
              {hero.patientName ?? hero.patient?.name ?? "Paciente"}
            </p>
            <p className="text-[13px] mt-0.5" style={{ color: "rgba(255,255,255,.48)" }}>
              {hero.procedureName ?? hero.procedure?.name ?? "Procedimento"}
            </p>
          </div>

          {/* actions */}
          <div className="shrink-0 flex gap-2 z-10">
            <Link href={createTenantLink(tenant, `/dashboard/appointments`)}>
              <button
                type="button"
                className="px-[15px] py-2 rounded-lg text-[13px] font-medium transition-colors"
                style={{ background: "rgba(255,255,255,.09)", color: "rgba(255,255,255,.7)" }}
              >
                Ver agenda
              </button>
            </Link>
          </div>
        </section>
      ) : (
        <section
          className="rounded-2xl px-6 py-5 flex items-center gap-4"
          style={{ background: "var(--t1)" }}
        >
          <p className="text-[15px]" style={{ color: "rgba(255,255,255,.5)" }}>
            Nenhum agendamento para hoje.
          </p>
          <Link href={createTenantLink(tenant, "/dashboard/appointments")} className="ml-auto z-10">
            <button
              type="button"
              className="px-4 py-2 rounded-lg text-[13px] font-medium"
              style={{ background: "var(--acc)", color: "#fff" }}
            >
              Agendar
            </button>
          </Link>
        </section>
      )}

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Faturamento",   value: `R$ ${statRev.toLocaleString("pt-BR")}`,     hint: "acumulado" },
          { label: "Consultas",     value: statAppt,                                      hint: "total realizadas" },
          { label: "Pacientes",     value: statPat,                                       hint: "cadastrados" },
          { label: "Profissionais", value: statProf,                                      hint: "ativos" },
        ].map(({ label, value, hint }) => (
          <div
            key={label}
            className="rounded-xl p-4"
            style={{ background: "#fff", border: "1px solid var(--border-w)", boxShadow: "0 1px 3px rgba(26,23,20,.06)" }}
          >
            <p className="text-[10.5px] font-semibold uppercase tracking-[.8px]" style={{ color: "var(--t3)" }}>{label}</p>
            <p style={{ fontFamily: "var(--f-serif)", fontSize: 28, fontWeight: 400, color: "var(--t1)", letterSpacing: -1, lineHeight: 1.1, marginTop: 5 }}>
              {value}
            </p>
            <p className="text-[11.5px] mt-0.5" style={{ color: "var(--t3)" }}>{hint}</p>
          </div>
        ))}
      </div>

      {/* ── BOTTOM GRID ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">

        {/* Agenda de hoje */}
        <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid var(--border-w)", boxShadow: "0 1px 3px rgba(26,23,20,.06)" }}>
          <div className="px-[18px] py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-w)" }}>
            <span className="text-[13.5px] font-semibold" style={{ color: "var(--t1)" }}>Agenda de hoje</span>
            <Link href={createTenantLink(tenant, "/dashboard/appointments")} className="text-[12px] font-medium" style={{ color: "var(--acc-dk)" }}>
              Ver tudo
            </Link>
          </div>

          {todayAppts.length === 0 ? (
            <div className="px-[18px] py-8 text-center text-[13px]" style={{ color: "var(--t3)" }}>
              Nenhum agendamento hoje.
            </div>
          ) : (
            <div>
              {todayAppts.slice(0, 8).map((a) => (
                <div
                  key={a.id}
                  className="grid gap-2.5 px-[18px] py-2.5 transition-colors cursor-pointer"
                  style={{
                    gridTemplateColumns: "56px 1fr auto",
                    alignItems: "center",
                    borderBottom: "1px solid var(--border-w)",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--page-bg)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = ""; }}
                >
                  <span style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 14, color: "var(--acc-dk)", textAlign: "right", lineHeight: 1 }}>
                    {fmtTime(a.scheduledAt ?? a.date ?? "")}
                  </span>
                  <div>
                    <p className="text-[13.5px] font-medium" style={{ color: "var(--t1)" }}>
                      {a.patientName ?? a.patient?.name ?? "—"}
                    </p>
                    <p className="text-[12px]" style={{ color: "var(--t3)" }}>
                      {a.procedureName ?? a.procedure?.name ?? ""}
                    </p>
                  </div>
                  <StatusPill status={a.status ?? "PENDING"} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ações rápidas */}
        <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid var(--border-w)", boxShadow: "0 1px 3px rgba(26,23,20,.06)" }}>
          <div className="px-[18px] py-3.5" style={{ borderBottom: "1px solid var(--border-w)" }}>
            <span className="text-[13.5px] font-semibold" style={{ color: "var(--t1)" }}>Ações rápidas</span>
          </div>
          <div className="p-3 space-y-1.5">
            {quickActions.map(({ icon: Icon, label, path }) => (
              <Link key={path} href={createTenantLink(tenant, path)}>
                <div
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--acc-lt)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = ""; }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--acc-lt)" }}>
                    <Icon className="w-4 h-4" style={{ color: "var(--acc-dk)" }} />
                  </div>
                  <span className="text-[13.5px] font-medium flex-1" style={{ color: "var(--t1)" }}>{label}</span>
                  <ArrowRight className="w-3.5 h-3.5" style={{ color: "var(--t3)" }} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar campos do tipo Appointment**

O tipo `Appointment` em `src/services/appointments/appointment.service.ts` pode não ter todos os campos usados acima (`scheduledAt`, `patientName`, `procedureName`, `patient`, `procedure`). Verificar e ajustar os acessos de propriedade para o que o tipo real expõe:

```bash
grep -n "interface Appointment\|type Appointment\|scheduledAt\|patientName\|procedureName" \
  "c:\dev\repository\bianca\clinic-full-stack\src\services\appointments\appointment.service.ts" | head -30
```

Se os campos tiverem nomes diferentes (ex: `dateTime` em vez de `scheduledAt`), ajustar os acessos no componente recém-escrito.

- [ ] **Step 3: Verificar TypeScript**

```bash
pnpm tsc --noEmit 2>&1 | grep -v "node_modules" | grep "error TS" | head -20
```

Corrigir novos erros (erros pré-existentes ignorar).

- [ ] **Step 4: Commit**

```bash
git add src/app/\[tenant\]/dashboard/_components/general-tab.tsx
git commit -m "style: dashboard general tab with hero card, stats, agenda timeline"
```

---

## Task 8 — Verificação visual e commit final do plano

- [ ] **Step 1: Iniciar os servidores**

```bash
# Terminal 1 — backend
cd c:\dev\repository\bianca\saas-clinic && pnpm dev

# Terminal 2 — frontend
cd c:\dev\repository\bianca\clinic-full-stack && pnpm dev
```

- [ ] **Step 2: Verificar checklist visual no browser**

Acessar `http://localhost:3005/{seu-tenant}/dashboard` e conferir:

- [ ] Sidebar tem fundo claro warm gray (não mais escuro)
- [ ] Logo "bianca" aparece em serif itálico caramelo escuro
- [ ] Topbar tem fundo claro, data em itálico, botão preto
- [ ] Sino tem ponto âmbar (não vermelho nem caramelo)
- [ ] Hero card tem fundo escuro `#1A1714` com horário em caramelo
- [ ] 4 stat cards com contadores que animam ao entrar
- [ ] Agenda lista os appointments de hoje com horário em serif caramelo
- [ ] Ações rápidas com hover caramelo claro

- [ ] **Step 3: Commit final da branch**

```bash
cd c:\dev\repository\bianca\clinic-full-stack
git log --oneline -6
```

Expected: 4 commits da branch `feature/ui-redesign` visíveis.

---

## Self-Review

**1. Spec coverage:**
- ✅ Commit backend `mvp/billing` — Task 1
- ✅ Commit frontend funcional `mvp/billing` — Task 2
- ✅ Nova branch `feature/ui-redesign` — Task 3
- ✅ Tokens CSS novos (caramelo, sem roxo) — Task 4
- ✅ Sidebar claro com Palatino — Task 5
- ✅ Topbar claro com data em serif + âmbar no sino — Task 6
- ✅ Hero card + stats + agenda + ações rápidas — Task 7
- ✅ Verificação visual — Task 8

**2. Placeholder scan:** nenhum TBD, nenhum "add validation" vago — todo passo tem código completo.

**3. Type consistency:** `Appointment` fields devem ser verificados no Step 2 da Task 7 porque o tipo real pode divergir do HTML prototype.

**Lacuna conhecida:** Os campos `scheduledAt`, `patientName`, `procedureName` do tipo `Appointment` precisam ser ajustados na Task 7 Step 2 conforme o tipo real do serviço — isso está explicitado no passo.
