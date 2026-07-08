"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, LogOut, Plus, Stethoscope } from "lucide-react";
import { fetchAdminMe, logoutUser } from "@/services/auth/auth.service";

const NAV = [
  { href: "/admin/clinics", icon: Building2, label: "Clínicas" },
  { href: "/admin/onboard", icon: Plus, label: "Nova Clínica" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setChecked(true);
      return;
    }

    setChecked(false);
    fetchAdminMe()
      .then((me) => {
        if (me.role !== "ADMIN") router.replace("/admin/login");
        else setChecked(true);
      })
      .catch(() => router.replace("/admin/login"));
  }, [pathname]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-6 h-6 border-2 border-[#cb9849] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-white/[0.07]"
        style={{ background: "linear-gradient(180deg, #080b1a 0%, #050812 100%)" }}>

        {/* Logo */}
        <div className="px-4 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8a6020] flex items-center justify-center shrink-0">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-white leading-tight">Cliniker</p>
              <p className="text-[10px] text-white/40 leading-tight">Superadmin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link key={href} href={href}>
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-all"
                  style={active
                    ? { background: "rgba(124,58,237,0.16)", color: "#fff", fontWeight: 600 }
                    : { color: "rgba(255,255,255,0.5)" }
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" style={{ color: active ? "#f5b85a" : undefined }} />
                  {label}
                </button>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={async () => {
              try { await logoutUser(); } catch {}
              router.replace("/admin/login");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] text-white/40 hover:text-white/80 hover:bg-white/[0.05] transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-[#f4f4f8]">
        {children}
      </main>
    </div>
  );
}
