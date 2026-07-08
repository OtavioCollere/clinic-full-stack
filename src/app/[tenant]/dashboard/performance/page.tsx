"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Calendar, DollarSign, XCircle, AlertCircle } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import {
  getAppointmentHistoryByClinicId,
  getAppointmentsByClinicId,
  type Appointment,
} from "@/services/appointments/appointment.service";
import { getProceduresByClinicId } from "@/services/procedures/procedure.service";

// ── Types ─────────────────────────────────────────────────────────────────────

type Period = "week" | "month" | "quarter" | "all";
type SortKey = "revenue" | "appointments" | "avgTicket" | "cancellation";

interface ProfessionalStats {
  professionalId: string;
  name: string;
  total: number;
  done: number;
  canceled: number;
  noShow: number;
  revenue: number;
  avgTicket: number;
  cancellationRate: number;
  completionRate: number;
  topProcedure: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function getPeriodStart(period: Period): Date | null {
  const now = new Date();
  switch (period) {
    case "week":    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    case "month":   return new Date(now.getFullYear(), now.getMonth(), 1);
    case "quarter": return new Date(now.getFullYear(), now.getMonth() - 3, 1);
    default:        return null;
  }
}

function buildStats(
  appointments: Appointment[],
  procedureMap: Map<string, string>
): ProfessionalStats[] {
  const map = new Map<string, ProfessionalStats>();
  const procCounts = new Map<string, Map<string, number>>();
  const now = new Date();

  for (const apt of appointments) {
    const id = apt.professionalId;
    if (!map.has(id)) {
      map.set(id, {
        professionalId: id,
        name: apt.professionalName ?? "Profissional",
        total: 0, done: 0, canceled: 0, noShow: 0,
        revenue: 0, avgTicket: 0, cancellationRate: 0, completionRate: 0,
        topProcedure: null,
      });
    }
    const s = map.get(id)!;
    s.total += 1;

    if (apt.status === "DONE") {
      s.done += 1;
      s.revenue += apt.appointmentItems.reduce((sum, i) => sum + Number(i.price || 0), 0);
      // track procedure counts
      if (!procCounts.has(id)) procCounts.set(id, new Map());
      const counts = procCounts.get(id)!;
      for (const item of apt.appointmentItems) {
        counts.set(item.procedureId, (counts.get(item.procedureId) ?? 0) + 1);
      }
    } else if (apt.status === "CANCELED") {
      s.canceled += 1;
    } else if ((apt.status === "WAITING" || apt.status === "CONFIRMED") && new Date(apt.startAt) < now) {
      s.noShow += 1;
    }
  }

  return Array.from(map.values()).map((s) => {
    const counts = procCounts.get(s.professionalId);
    let topProcedure: string | null = null;
    if (counts && counts.size > 0) {
      const [topId] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
      topProcedure = procedureMap.get(topId) ?? null;
    }
    return {
      ...s,
      avgTicket:        s.done  > 0 ? s.revenue / s.done   : 0,
      cancellationRate: s.total > 0 ? (s.canceled / s.total) * 100 : 0,
      completionRate:   s.total > 0 ? (s.done     / s.total) * 100 : 0,
      topProcedure,
    };
  });
}

function buildMonthly(appointments: Appointment[]) {
  const map = new Map<string, { month: string; Agendadas: number; Realizadas: number; Receita: number }>();
  for (const apt of appointments) {
    const date = new Date(apt.startAt);
    const key  = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    if (!map.has(key)) map.set(key, { month: label, Agendadas: 0, Realizadas: 0, Receita: 0 });
    const m = map.get(key)!;
    m.Agendadas++;
    if (apt.status === "DONE") {
      m.Realizadas++;
      m.Receita += apt.appointmentItems.reduce((sum, i) => sum + Number(i.price || 0), 0);
    }
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
}

function buildProcedureBreakdown(
  appointments: Appointment[],
  procedureMap: Map<string, string>
) {
  const map = new Map<string, { procedureId: string; name: string; count: number; revenue: number }>();
  for (const apt of appointments) {
    if (apt.status !== "DONE") continue;
    for (const item of apt.appointmentItems) {
      const name = procedureMap.get(item.procedureId) ?? "Procedimento";
      if (!map.has(item.procedureId)) {
        map.set(item.procedureId, { procedureId: item.procedureId, name, count: 0, revenue: 0 });
      }
      const p = map.get(item.procedureId)!;
      p.count++;
      p.revenue += Number(item.price || 0);
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

const tickTrunc = (v: string) => (v.length > 18 ? v.slice(0, 17) + "…" : v);

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, icon, gradient,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.6)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
      }}
    >
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-2xl"
        style={{ background: gradient }}
      />
      <div className="flex items-start justify-between mb-3 relative">
        <p className="text-[13px] font-medium text-slate-500">{label}</p>
        <div className="p-2 rounded-xl" style={{ background: gradient + "22" }}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-800 mb-1 relative">{value}</p>
      <p className="text-xs text-slate-400 relative">{sub}</p>
    </div>
  );
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2 text-sm shadow-xl"
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color ?? p.stroke }} className="text-xs">
          {p.name}: <span className="font-medium">
            {currency ? formatCurrency(p.value) : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}

// ── Glass card wrapper ────────────────────────────────────────────────────────

function Glass({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl p-6 ${className}`}
      style={{
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.6)",
        boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
      }}
    >
      {children}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PerformancePage() {
  const { user } = useAuthContext();
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [procedureMap, setProcedureMap] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("month");
  const [sortBy, setSortBy] = useState<SortKey>("revenue");
  const [selectedProfId, setSelectedProfId] = useState<string>("all");

  useEffect(() => {
    if (!user?.clinicId) return;
    const clinicId = user.clinicId as string;
    const load = async () => {
      setIsLoading(true);
      try {
        const [historyRes, activeRes, procsRes] = await Promise.all([
          getAppointmentHistoryByClinicId(clinicId, 1, 1000),
          getAppointmentsByClinicId(clinicId, { period: "all" }),
          getProceduresByClinicId(clinicId).catch(() => []),
        ]);
        const history = Array.isArray(historyRes?.items) ? historyRes.items : [];
        const active  = Array.isArray(activeRes) ? activeRes : [];
        const seen = new Set<string>();
        const merged = [...history, ...active].filter((a) => {
          if (seen.has(a.id)) return false;
          seen.add(a.id);
          return true;
        });
        setAllAppointments(merged);

        const procs = Array.isArray(procsRes) ? procsRes : [];
        const pMap = new Map<string, string>();
        procs.forEach((p: any) => pMap.set(p.id, p.name));
        setProcedureMap(pMap);
      } catch { /* silent */ } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?.clinicId]);

  // All unique professionals (from full dataset, not period-filtered)
  const professionals = useMemo(() => {
    const map = new Map<string, string>();
    allAppointments.forEach((a) => {
      if (a.professionalId && a.professionalName) map.set(a.professionalId, a.professionalName);
    });
    return [...map.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [allAppointments]);

  const filtered = useMemo(() => {
    const start = getPeriodStart(period);
    let apts = allAppointments;
    if (start) apts = apts.filter((a) => new Date(a.startAt) >= start);
    if (selectedProfId !== "all") apts = apts.filter((a) => a.professionalId === selectedProfId);
    return apts;
  }, [allAppointments, period, selectedProfId]);

  const stats = useMemo(() => buildStats(filtered, procedureMap), [filtered, procedureMap]);

  const sorted = useMemo(() => {
    return [...stats].sort((a, b) => {
      switch (sortBy) {
        case "revenue":      return b.revenue - a.revenue;
        case "appointments": return b.total - a.total;
        case "avgTicket":    return b.avgTicket - a.avgTicket;
        case "cancellation": return b.cancellationRate - a.cancellationRate;
      }
    });
  }, [stats, sortBy]);

  const kpi = useMemo(() => {
    const total    = filtered.length;
    const done     = filtered.filter((a) => a.status === "DONE").length;
    const canceled = filtered.filter((a) => a.status === "CANCELED").length;
    const now      = new Date();
    const noShow   = filtered.filter(
      (a) => (a.status === "WAITING" || a.status === "CONFIRMED") && new Date(a.startAt) < now
    ).length;
    const revenue  = filtered
      .filter((a) => a.status === "DONE")
      .reduce((sum, a) => sum + a.appointmentItems.reduce((s, i) => s + Number(i.price || 0), 0), 0);
    return {
      total, done, canceled, noShow, revenue,
      avgTicket:        done  > 0 ? revenue / done    : 0,
      cancellationRate: total > 0 ? (canceled / total) * 100 : 0,
      noShowRate:       total > 0 ? (noShow   / total) * 100 : 0,
    };
  }, [filtered]);

  // Monthly trend (used when a specific professional is selected)
  const monthlyData = useMemo(() => buildMonthly(filtered), [filtered]);

  // Procedure breakdown (used when a specific professional is selected)
  const procedureBreakdown = useMemo(
    () => buildProcedureBreakdown(filtered, procedureMap),
    [filtered, procedureMap]
  );

  const isSingleProf = selectedProfId !== "all";
  const selectedProfName = isSingleProf
    ? professionals.find((p) => p.id === selectedProfId)?.name ?? "Profissional"
    : null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-100 rounded-xl animate-pulse w-80" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="h-72 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-72 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-0.5">Performance</h1>
          <p className="text-sm text-slate-400">
            {isSingleProf
              ? `Análise individual — ${selectedProfName}`
              : "Desempenho individual da equipe clínica"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Professional filter */}
          {professionals.length > 0 && (
            <Select value={selectedProfId} onValueChange={setSelectedProfId}>
              <SelectTrigger
                className="w-48 rounded-xl border-0 text-sm font-medium text-slate-600"
                style={{
                  background: "rgba(255,255,255,0.8)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 1px 8px rgba(0,0,0,0.08)",
                }}
              >
                <SelectValue placeholder="Todos os profissionais" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Todos os profissionais</SelectItem>
                {professionals.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {/* Period filter */}
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger
              className="w-40 rounded-xl border-0 text-sm font-medium text-slate-600"
              style={{
                background: "rgba(255,255,255,0.8)",
                backdropFilter: "blur(8px)",
                boxShadow: "0 1px 8px rgba(0,0,0,0.08)",
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Este mês</SelectItem>
              <SelectItem value="quarter">Últimos 3 meses</SelectItem>
              <SelectItem value="all">Todo período</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Consultas Realizadas"
          value={kpi.done}
          sub={`de ${kpi.total} agendadas`}
          icon={<Calendar className="w-4 h-4" style={{ color: "#cb9849" }} />}
          gradient="linear-gradient(135deg,#cb9849,#f5b85a)"
        />
        <KpiCard
          label="Receita Total"
          value={formatCurrency(kpi.revenue)}
          sub={`ticket médio ${formatCurrency(kpi.avgTicket)}`}
          icon={<DollarSign className="w-4 h-4" style={{ color: "#059669" }} />}
          gradient="linear-gradient(135deg,#059669,#34d399)"
        />
        <KpiCard
          label="Cancelamentos"
          value={formatPercent(kpi.cancellationRate)}
          sub={`${kpi.canceled} cancelada${kpi.canceled !== 1 ? "s" : ""}`}
          icon={<XCircle className="w-4 h-4" style={{ color: "#e11d48" }} />}
          gradient="linear-gradient(135deg,#e11d48,#fb7185)"
        />
        <KpiCard
          label="Não Comparecimentos"
          value={kpi.noShow}
          sub={formatPercent(kpi.noShowRate) + " do total"}
          icon={<AlertCircle className="w-4 h-4" style={{ color: "#d97706" }} />}
          gradient="linear-gradient(135deg,#d97706,#fbbf24)"
        />
      </div>

      {/* Charts — comparison (all) vs trend (single professional) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {isSingleProf ? (
          /* Monthly appointment trend */
          <Glass>
            <p className="text-sm font-semibold text-slate-700 mb-5">Evolução de Consultas</p>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyData} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                  <defs>
                    <linearGradient id="gradLine1" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#cb9849" />
                      <stop offset="100%" stopColor="#f5b85a" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: "11px" }} tickLine={false} axisLine={false} />
                  <YAxis stroke="#cbd5e1" style={{ fontSize: "11px" }} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(0,0,0,0.06)" }} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
                  <Line type="monotone" dataKey="Agendadas" stroke="#c4b5fd" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Realizadas" stroke="#cb9849" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-400 text-center py-16">Nenhum dado no período.</p>
            )}
          </Glass>
        ) : (
          /* Professional comparison — appointments */
          <Glass>
            <p className="text-sm font-semibold text-slate-700 mb-5">Consultas por Profissional</p>
            {stats.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={[...stats].sort((a, b) => b.total - a.total).slice(0, 8)
                    .map((s) => ({ name: s.name, Agendadas: s.total, Realizadas: s.done }))}
                  layout="vertical"
                  margin={{ left: 10, right: 16, top: 4, bottom: 4 }}
                >
                  <defs>
                    <linearGradient id="gradTotal" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#c4b5fd" />
                      <stop offset="100%" stopColor="#ddd6fe" />
                    </linearGradient>
                    <linearGradient id="gradDone" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#cb9849" />
                      <stop offset="100%" stopColor="#f5b85a" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" horizontal={false} />
                  <XAxis type="number" stroke="#cbd5e1" style={{ fontSize: "11px" }} tickLine={false} axisLine={false} />
                  <YAxis
                    dataKey="name" type="category"
                    stroke="#94a3b8" style={{ fontSize: "11px" }}
                    width={150} tickLine={false} axisLine={false}
                    tickFormatter={tickTrunc}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                  <Bar dataKey="Agendadas" fill="url(#gradTotal)" radius={[0, 6, 6, 0]} barSize={10} />
                  <Bar dataKey="Realizadas" fill="url(#gradDone)"  radius={[0, 6, 6, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-400 text-center py-16">Nenhum dado no período.</p>
            )}
          </Glass>
        )}

        {isSingleProf ? (
          /* Monthly revenue trend */
          <Glass>
            <p className="text-sm font-semibold text-slate-700 mb-5">Evolução de Receita</p>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyData} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: "11px" }} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#cbd5e1" style={{ fontSize: "11px" }} tickLine={false} axisLine={false}
                    tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<ChartTooltip currency />} cursor={{ stroke: "rgba(0,0,0,0.06)" }} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
                  <Line type="monotone" dataKey="Receita" stroke="#059669" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-400 text-center py-16">Nenhum dado no período.</p>
            )}
          </Glass>
        ) : (
          /* Professional comparison — revenue */
          <Glass>
            <p className="text-sm font-semibold text-slate-700 mb-5">Receita por Profissional</p>
            {stats.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={[...stats].sort((a, b) => b.revenue - a.revenue).slice(0, 8)
                    .map((s) => ({ name: s.name, Receita: s.revenue, "Ticket Médio": s.avgTicket }))}
                  layout="vertical"
                  margin={{ left: 10, right: 16, top: 4, bottom: 4 }}
                >
                  <defs>
                    <linearGradient id="gradRevenue" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#059669" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                    <linearGradient id="gradTicket" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#a7f3d0" />
                      <stop offset="100%" stopColor="#d1fae5" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" horizontal={false} />
                  <XAxis
                    type="number" stroke="#cbd5e1" style={{ fontSize: "11px" }} tickLine={false} axisLine={false}
                    tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    dataKey="name" type="category"
                    stroke="#94a3b8" style={{ fontSize: "11px" }}
                    width={150} tickLine={false} axisLine={false}
                    tickFormatter={tickTrunc}
                  />
                  <Tooltip content={<ChartTooltip currency />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                  <Bar dataKey="Receita"      fill="url(#gradRevenue)" radius={[0, 6, 6, 0]} barSize={10} />
                  <Bar dataKey="Ticket Médio" fill="url(#gradTicket)"  radius={[0, 6, 6, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-400 text-center py-16">Nenhum dado no período.</p>
            )}
          </Glass>
        )}
      </div>

      {/* Bottom section — ranking (all) or procedure breakdown (single) */}
      {isSingleProf ? (
        <Glass>
          <p className="text-sm font-semibold text-slate-700 mb-5">Procedimentos Realizados</p>
          {procedureBreakdown.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">Nenhum procedimento registrado no período.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["#", "Procedimento", "Realizações", "Receita", "Média por Realização"].map((h, i) => (
                      <th
                        key={h}
                        className={`py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400 ${i > 1 ? "text-right" : "text-left"}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {procedureBreakdown.map((p, i) => (
                    <tr key={p.procedureId} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold inline-flex items-center justify-center">
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700">{p.name}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-semibold text-[#8a6020]">{p.count}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-700">
                        {formatCurrency(p.revenue)}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500">
                        {formatCurrency(p.count > 0 ? p.revenue / p.count : 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Glass>
      ) : (
        <Glass>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <p className="text-sm font-semibold text-slate-700">Ranking de Profissionais</p>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
              <SelectTrigger
                className="w-44 rounded-xl border-0 text-sm"
                style={{ background: "rgba(0,0,0,0.04)" }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="revenue">Por Receita</SelectItem>
                <SelectItem value="appointments">Por Consultas</SelectItem>
                <SelectItem value="avgTicket">Por Ticket Médio</SelectItem>
                <SelectItem value="cancellation">Por Cancelamento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {sorted.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">Nenhum dado no período.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["#","Profissional","Top Procedimento","Agendadas","Realizadas","Receita","Ticket Médio","Aproveit.","Cancel.","Não Comp."].map((h, i) => (
                      <th
                        key={h}
                        className={`py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400 ${i > 2 ? "text-right" : "text-left"}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((p, i) => (
                    <tr
                      key={p.professionalId}
                      className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors cursor-pointer"
                      onClick={() => setSelectedProfId(p.professionalId)}
                    >
                      <td className="py-3 px-3">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold inline-flex items-center justify-center">
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700">{p.name}</td>
                      <td className="py-3 px-3">
                        {p.topProcedure ? (
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ background: "#ede9fe", color: "#5b21b6" }}
                          >
                            {p.topProcedure}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-400">{p.total}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-semibold text-[#8a6020]">{p.done}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-700">
                        {formatCurrency(p.revenue)}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500">
                        {formatCurrency(p.avgTicket)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={
                            p.completionRate >= 70
                              ? { background: "#d1fae5", color: "#065f46" }
                              : p.completionRate >= 50
                              ? { background: "#fef3c7", color: "#92400e" }
                              : { background: "#fee2e2", color: "#991b1b" }
                          }
                        >
                          {formatPercent(p.completionRate)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={
                            p.cancellationRate > 20
                              ? { background: "#fee2e2", color: "#991b1b" }
                              : p.cancellationRate > 10
                              ? { background: "#fef3c7", color: "#92400e" }
                              : { background: "#d1fae5", color: "#065f46" }
                          }
                        >
                          {formatPercent(p.cancellationRate)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {p.noShow > 0 ? (
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={
                              p.noShow > 3
                                ? { background: "#fee2e2", color: "#991b1b" }
                                : { background: "#fef3c7", color: "#92400e" }
                            }
                          >
                            {p.noShow}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-slate-400 mt-3 text-center">Clique em um profissional para ver análise detalhada</p>
            </div>
          )}
        </Glass>
      )}
    </div>
  );
}
