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
  DONE:      { label: "Realizado",  bg: "var(--border-w)", color: "var(--t3)" },
  CONFIRMED: { label: "Confirmado", bg: "var(--grn-lt)",   color: "var(--grn)" },
  WAITING:   { label: "Aguardando", bg: "var(--amb-lt)",   color: "var(--amb)" },
  CANCELED:  { label: "Cancelado",  bg: "var(--red-lt)",   color: "var(--red-cl)" },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.WAITING;
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
      .then(([s, apptResp]) => {
        setStats(s);
        setAppointments(apptResp.items ?? []);
      })
      .finally(() => setLoading(false));
  }, [user?.clinicId]);

  /* today's appointments sorted by time */
  const today = todayIso();
  const todayAppts = appointments
    .filter((a) => a.startAt?.slice(0, 10) === today)
    .sort((a, b) => a.startAt.localeCompare(b.startAt));

  /* hero: first appointment from now, or first of today */
  const now = new Date();
  const hero =
    todayAppts.find((a) => new Date(a.startAt) >= now) ?? todayAppts[0];

  /* animated stat counters */
  const statRev  = useAnimatedCount(stats?.monthlyRevenue      ?? 0, 950, 200);
  const statAppt = useAnimatedCount(stats?.appointmentsToday   ?? 0, 800, 350);
  const statPat  = useAnimatedCount(stats?.totalPatients       ?? 0, 850, 400);
  const statProf = useAnimatedCount(stats?.activeProfessionals ?? 0, 700, 450);

  const quickActions = [
    { icon: Calendar,  label: "Nova Consulta", path: "/dashboard/appointments" },
    { icon: Users,     label: "Novo Paciente",  path: "/dashboard/patients" },
    { icon: UserCheck, label: "Profissionais",  path: "/dashboard/professionals" },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl animate-pulse h-[104px]" style={{ background: "#2A2520" }} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((k) => (
            <div
              key={k}
              className="bg-card rounded-xl border h-[96px] animate-pulse"
              style={{ borderColor: "var(--border-w)" }}
            />
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
            style={{
              background:
                "radial-gradient(ellipse at 80% 50%, rgba(192,158,117,.14) 0%, transparent 65%)",
            }}
          />

          {/* time block */}
          <div className="shrink-0 flex flex-col items-center gap-1.5">
            <span
              className="text-[9.5px] uppercase tracking-[1.2px]"
              style={{ color: "rgba(255,255,255,.32)" }}
            >
              {hero.status === "CONFIRMED" ? "Em atendimento" : "Próximo"}
            </span>
            <span
              style={{
                fontFamily: "var(--f-serif)",
                fontStyle: "italic",
                fontSize: 38,
                color: "var(--acc)",
                letterSpacing: -1.5,
                lineHeight: 1,
              }}
            >
              {fmtTime(hero.startAt)}
            </span>
          </div>

          <div className="w-px h-14 shrink-0" style={{ background: "rgba(255,255,255,.09)" }} />

          {/* info */}
          <div className="flex-1 min-w-0">
            <p className="text-[19px] font-semibold leading-tight" style={{ color: "#fff" }}>
              {hero.patientName ?? "Paciente"}
            </p>
            <p className="text-[13px] mt-0.5" style={{ color: "rgba(255,255,255,.48)" }}>
              {hero.name}
            </p>
          </div>

          {/* actions */}
          <div className="shrink-0 flex gap-2 z-10">
            <Link href={createTenantLink(tenant, "/dashboard/appointments")}>
              <button
                type="button"
                className="px-[15px] py-2 rounded-lg text-[13px] font-medium transition-colors"
                style={{ background: "rgba(255,255,255,.09)", color: "rgba(255,255,255,.7)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,.14)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,.09)";
                }}
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
          {
            label: "Receita mensal",
            value: `R$ ${statRev.toLocaleString("pt-BR")}`,
            hint:
              stats?.monthlyRevenueChange != null
                ? `${stats.monthlyRevenueChange > 0 ? "+" : ""}${stats.monthlyRevenueChange}% vs mês anterior`
                : "acumulado",
          },
          {
            label: "Consultas hoje",
            value: statAppt,
            hint:
              stats?.appointmentsTodayChange != null
                ? `${stats.appointmentsTodayChange > 0 ? "+" : ""}${stats.appointmentsTodayChange}% vs ontem`
                : "realizadas",
          },
          { label: "Pacientes",     value: statPat,  hint: "cadastrados" },
          { label: "Profissionais", value: statProf, hint: "ativos" },
        ].map(({ label, value, hint }) => (
          <div
            key={label}
            className="rounded-xl p-4"
            style={{
              background: "#fff",
              border: "1px solid var(--border-w)",
              boxShadow: "0 1px 3px rgba(26,23,20,.06)",
            }}
          >
            <p
              className="text-[10.5px] font-semibold uppercase tracking-[.8px]"
              style={{ color: "var(--t3)" }}
            >
              {label}
            </p>
            <p
              style={{
                fontFamily: "var(--f-serif)",
                fontSize: 28,
                fontWeight: 400,
                color: "var(--t1)",
                letterSpacing: -1,
                lineHeight: 1.1,
                marginTop: 5,
              }}
            >
              {value}
            </p>
            <p className="text-[11.5px] mt-0.5" style={{ color: "var(--t3)" }}>
              {hint}
            </p>
          </div>
        ))}
      </div>

      {/* ── BOTTOM GRID ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">

        {/* Agenda de hoje */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "#fff",
            border: "1px solid var(--border-w)",
            boxShadow: "0 1px 3px rgba(26,23,20,.06)",
          }}
        >
          <div
            className="px-[18px] py-3.5 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--border-w)" }}
          >
            <span className="text-[13.5px] font-semibold" style={{ color: "var(--t1)" }}>
              Agenda de hoje
            </span>
            <Link
              href={createTenantLink(tenant, "/dashboard/appointments")}
              className="text-[12px] font-medium"
              style={{ color: "var(--acc-dk)" }}
            >
              Ver tudo
            </Link>
          </div>

          {todayAppts.length === 0 ? (
            <div
              className="px-[18px] py-8 text-center text-[13px]"
              style={{ color: "var(--t3)" }}
            >
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
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = "var(--page-bg)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = "";
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--f-serif)",
                      fontStyle: "italic",
                      fontSize: 14,
                      color: "var(--acc-dk)",
                      textAlign: "right",
                      lineHeight: 1,
                    }}
                  >
                    {fmtTime(a.startAt)}
                  </span>
                  <div>
                    <p className="text-[13.5px] font-medium" style={{ color: "var(--t1)" }}>
                      {a.patientName ?? "—"}
                    </p>
                    <p className="text-[12px]" style={{ color: "var(--t3)" }}>
                      {a.name}
                    </p>
                  </div>
                  <StatusPill status={a.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ações rápidas */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "#fff",
            border: "1px solid var(--border-w)",
            boxShadow: "0 1px 3px rgba(26,23,20,.06)",
          }}
        >
          <div
            className="px-[18px] py-3.5"
            style={{ borderBottom: "1px solid var(--border-w)" }}
          >
            <span className="text-[13.5px] font-semibold" style={{ color: "var(--t1)" }}>
              Ações rápidas
            </span>
          </div>
          <div className="p-3 space-y-1.5">
            {quickActions.map(({ icon: Icon, label, path }) => (
              <Link key={path} href={createTenantLink(tenant, path)}>
                <div
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = "var(--acc-lt)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = "";
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "var(--acc-lt)" }}
                  >
                    <Icon className="w-4 h-4" style={{ color: "var(--acc-dk)" }} />
                  </div>
                  <span
                    className="text-[13.5px] font-medium flex-1"
                    style={{ color: "var(--t1)" }}
                  >
                    {label}
                  </span>
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
