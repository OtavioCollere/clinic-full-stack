"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Users } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import {
  getAppointmentHistoryByClinicId,
  getAppointmentsByClinicId,
  type Appointment,
} from "@/services/appointments/appointment.service";
import { getProceduresByClinicId } from "@/services/procedures/procedure.service";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getMonthKey(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
}

export default function FinancialPage() {
  const { user } = useAuthContext();
  const [doneAppointments, setDoneAppointments] = useState<Appointment[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [procedures, setProcedures] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [procedureMetric, setProcedureMetric] = useState<"count" | "revenue">("count");

  useEffect(() => {
    if (!user?.clinicId) return;
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const [historyRes, aptsRes, procsRes] = await Promise.all([
          getAppointmentHistoryByClinicId(user.clinicId as string, 1, 1000),
          getAppointmentsByClinicId(user.clinicId as string, { period: "all" }),
          getProceduresByClinicId(user.clinicId as string),
        ]);
        const done = Array.isArray(historyRes?.items)
          ? historyRes.items.filter((a) => a.status === "DONE")
          : [];
        setDoneAppointments(done);
        setAppointments(Array.isArray(aptsRes) ? aptsRes : []);
        setProcedures(Array.isArray(procsRes) ? procsRes : []);
      } catch {
        /* silent — partial data is fine for a dashboard */
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [user?.clinicId]);

  // ── Monthly revenue (last 12 months) ──────────────────────────────────────
  const monthlyRevenue = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const revenue = doneAppointments
        .filter((a) => getMonthKey(a.startAt) === key)
        .reduce(
          (sum, a) =>
            sum + a.appointmentItems.reduce((s, item) => s + Number(item.price || 0), 0),
          0
        );
      return {
        monthName: d.toLocaleDateString("pt-BR", { month: "short" }),
        revenue,
      };
    });
  }, [doneAppointments]);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const { currentMonthRevenue, lastMonthRevenue, revenueGrowthPercent } = useMemo(() => {
    const now = new Date();
    const curKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevKey = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;
    const sumItems = (apts: Appointment[]) =>
      apts.reduce(
        (sum, a) =>
          sum + a.appointmentItems.reduce((s, item) => s + Number(item.price || 0), 0),
        0
      );
    const cur = sumItems(doneAppointments.filter((a) => getMonthKey(a.startAt) === curKey));
    const last = sumItems(doneAppointments.filter((a) => getMonthKey(a.startAt) === prevKey));
    const growth = last > 0 ? ((cur - last) / last) * 100 : 0;
    return { currentMonthRevenue: cur, lastMonthRevenue: last, revenueGrowthPercent: growth };
  }, [doneAppointments]);

  // ── New patients this month (first appointment per patient) ───────────────
  const { newPatientsThisMonth, newPatientsLastMonth, newPatientsGrowthPercent } = useMemo(() => {
    const now = new Date();
    const curKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevKey = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;

    // Find first appointment per patient
    const firstApt: Record<string, string> = {};
    appointments.forEach((apt) => {
      const pid = apt.patientId;
      if (!firstApt[pid] || apt.createdAt < firstApt[pid]) {
        firstApt[pid] = apt.createdAt;
      }
    });

    const curNew = Object.values(firstApt).filter(
      (d) => getMonthKey(d) === curKey
    ).length;
    const prevNew = Object.values(firstApt).filter(
      (d) => getMonthKey(d) === prevKey
    ).length;
    const growth = prevNew > 0 ? ((curNew - prevNew) / prevNew) * 100 : 0;
    return {
      newPatientsThisMonth: curNew,
      newPatientsLastMonth: prevNew,
      newPatientsGrowthPercent: growth,
    };
  }, [appointments]);

  // ── Top procedures (count + revenue) ─────────────────────────────────────
  const topProcedures = useMemo(() => {
    const stats: Record<string, { count: number; revenue: number }> = {};
    doneAppointments.forEach((apt) => {
      apt.appointmentItems.forEach((item) => {
        if (!item.procedureId) return;
        if (!stats[item.procedureId]) stats[item.procedureId] = { count: 0, revenue: 0 };
        stats[item.procedureId].count += 1;
        stats[item.procedureId].revenue += Number(item.price || 0);
      });
    });
    return Object.entries(stats).map(([procedureId, { count, revenue }]) => {
      const proc = procedures.find((p) => p.id === procedureId);
      return { name: proc?.name ?? "Procedimento", count, revenue };
    });
  }, [doneAppointments, procedures]);

  // ── Returning patients per month ──────────────────────────────────────────
  const returningPatientsMonthly = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const patientsThisMonth = new Set(
        appointments
          .filter((a) => getMonthKey(a.createdAt) === key)
          .map((a) => a.patientId)
      );
      // "Returning" = patients who also appear in earlier months
      const earlierPatients = new Set(
        appointments
          .filter((a) => getMonthKey(a.createdAt) < key)
          .map((a) => a.patientId)
      );
      const returning = [...patientsThisMonth].filter((p) => earlierPatients.has(p)).length;
      return {
        monthName: d.toLocaleDateString("pt-BR", { month: "short" }),
        count: returning,
      };
    });
  }, [appointments]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-border rounded animate-pulse w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-40 bg-border rounded-xl animate-pulse" />
          <div className="h-40 bg-border rounded-xl animate-pulse" />
        </div>
        <div className="h-80 bg-border rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Financeiro</h1>
        <p className="text-muted-foreground">Acompanhe o desempenho financeiro da clínica</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Faturamento Mensal */}
        <Card className="p-6 border border-slate-200 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  Faturamento Mensal
                </p>
                <p className="text-4xl font-bold text-foreground">
                  {formatCurrency(currentMonthRevenue)}
                </p>
              </div>
              <div
                className={`p-3 rounded-lg ${
                  revenueGrowthPercent >= 0 ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {revenueGrowthPercent >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200">
              <p className="text-xs text-muted-foreground">vs. mês anterior</p>
              <p
                className={`text-sm font-semibold mt-1 ${
                  revenueGrowthPercent >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {revenueGrowthPercent >= 0 ? "+" : ""}
                {revenueGrowthPercent.toFixed(1)}% (
                {formatCurrency(currentMonthRevenue - lastMonthRevenue)})
              </p>
            </div>
          </div>
        </Card>

        {/* Novos Pacientes */}
        <Card className="p-6 border border-slate-200 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  Novos Pacientes
                </p>
                <p className="text-4xl font-bold text-foreground">
                  {newPatientsThisMonth}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200">
              <p className="text-xs text-muted-foreground">vs. mês anterior</p>
              <p
                className={`text-sm font-semibold mt-1 ${
                  newPatientsGrowthPercent >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {newPatientsGrowthPercent >= 0 ? "+" : ""}
                {newPatientsGrowthPercent.toFixed(1)}% (
                {newPatientsThisMonth - newPatientsLastMonth > 0 ? "+" : ""}
                {newPatientsThisMonth - newPatientsLastMonth} novos)
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="space-y-6">
        {/* Monthly Revenue Line Chart */}
        <Card className="p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-6">Receita por Mês</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="monthName" stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <YAxis
                stroke="#94a3b8"
                style={{ fontSize: "12px" }}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
                formatter={(v) => formatCurrency(v as number)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#0ea5e9"
                strokeWidth={3}
                dot={{ fill: "#0ea5e9", r: 5 }}
                activeDot={{ r: 7 }}
                name="Receita"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Procedures Bar Chart */}
          <Card className="p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                Procedimentos
              </h3>
              <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-medium">
                <button
                  onClick={() => setProcedureMetric("count")}
                  className={`px-3 py-1.5 transition-colors ${
                    procedureMetric === "count"
                      ? "bg-primary text-white"
                      : "bg-card text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Mais realizados
                </button>
                <button
                  onClick={() => setProcedureMetric("revenue")}
                  className={`px-3 py-1.5 border-l border-slate-200 transition-colors ${
                    procedureMetric === "revenue"
                      ? "bg-primary text-white"
                      : "bg-card text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Mais lucrativos
                </button>
              </div>
            </div>
            {topProcedures.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[...topProcedures]
                    .sort((a, b) =>
                      procedureMetric === "count"
                        ? b.count - a.count
                        : b.revenue - a.revenue
                    )
                    .slice(0, 6)}
                  layout="vertical"
                  margin={{ left: 10, right: 20, top: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    stroke="#94a3b8"
                    style={{ fontSize: "12px" }}
                    tickFormatter={
                      procedureMetric === "revenue"
                        ? (v) => `R$${(v / 1000).toFixed(0)}k`
                        : undefined
                    }
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#94a3b8"
                    style={{ fontSize: "11px" }}
                    width={160}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                    formatter={(v) =>
                      procedureMetric === "revenue"
                        ? [formatCurrency(v as number), "Receita"]
                        : [v, "Realizações"]
                    }
                  />
                  <Bar
                    dataKey={procedureMetric}
                    fill={procedureMetric === "count" ? "#06b6d4" : "#1D4ED8"}
                    radius={[0, 8, 8, 0]}
                    name={procedureMetric === "count" ? "Realizações" : "Receita"}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">
                Nenhum procedimento registrado ainda.
              </p>
            )}
          </Card>

          {/* Returning Patients Area Chart */}
          <Card className="p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              Pacientes que Retornaram
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={returningPatientsMonthly}>
                <defs>
                  <linearGradient id="colorReturning" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="monthName" stroke="#94a3b8" style={{ fontSize: "12px" }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                  formatter={(v) => [v, "Pacientes"]}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorReturning)"
                  name="Retornos"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}
