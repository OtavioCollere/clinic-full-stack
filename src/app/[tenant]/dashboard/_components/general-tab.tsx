"use client";

import {
  ArrowRight,
  Calendar,
  DollarSign,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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

const quickActions = [
  {
    icon: <Calendar className="w-5 h-5" />,
    label: "Nova Consulta",
    path: "/dashboard/appointments",
    description: "Agendar uma nova consulta",
  },
  {
    icon: <Users className="w-5 h-5" />,
    label: "Novo Paciente",
    path: "/dashboard/patients",
    description: "Adicionar um novo paciente",
  },
  {
    icon: <UserCheck className="w-5 h-5" />,
    label: "Profissionais",
    path: "/dashboard/professionals",
    description: "Gerenciar equipe da clínica",
  },
];

const statSkeletonKeys = [
  "appointments",
  "patients",
  "revenue",
  "professionals",
];
const appointmentSkeletonRows = ["row-1", "row-2", "row-3"];
const appointmentSkeletonCells = ["patient", "professional", "time", "status"];

function StatCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border p-6 animate-pulse">
      <div className="h-9 w-9 bg-border rounded-lg mb-5" />
      <div className="h-2.5 w-24 bg-border rounded mb-3" />
      <div className="h-7 w-16 bg-border rounded mb-4" />
      <div className="h-px bg-border mb-3" />
      <div className="h-2.5 w-32 bg-border rounded" />
    </div>
  );
}

function ChangeIndicator({ value }: { value: number | null }) {
  if (value === null) return null;
  const isUp = value >= 0;
  return (
    <div className="flex items-center gap-1 text-xs">
      {isUp ? (
        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
      ) : (
        <TrendingDown className="w-3.5 h-3.5 text-red-400" />
      )}
      <span
        className={`font-semibold ${isUp ? "text-emerald-400" : "text-red-400"}`}
      >
        {isUp ? "+" : ""}
        {value}%
      </span>
    </div>
  );
}

const STATUS_LABELS: Record<string, string> = {
  WAITING: "Aguardando",
  CONFIRMED: "Confirmada",
  DONE: "Concluída",
  CANCELED: "Cancelada",
};

const STATUS_CLASSES: Record<string, string> = {
  WAITING: "bg-amber-500/15 text-amber-400",
  CONFIRMED: "bg-emerald-500/15 text-emerald-400",
  DONE: "bg-primary/15 text-primary",
  CANCELED: "bg-red-500/15 text-red-400",
};

function AppointmentStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASSES[status] ?? "bg-border text-muted-foreground"}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export default function GeneralTab() {
  const tenant = useTenant();
  const { user } = useAuthContext();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>(
    [],
  );
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  useEffect(() => {
    if (!user?.clinicId) return;
    Promise.all([
      getDashboardStats(user.clinicId)
        .then(setStats)
        .finally(() => setLoadingStats(false)),
      getAppointmentHistoryByClinicId(user.clinicId, 1, 5)
        .then((data) => {
          setRecentAppointments(data.items ?? []);
        })
        .finally(() => setLoadingAppointments(false)),
    ]);
  }, [user?.clinicId]);

  const statCards = stats
    ? [
        {
          icon: <Calendar className="w-5 h-5 text-primary" />,
          label: "Consultas de Hoje",
          value: stats.appointmentsToday.toString(),
          change: stats.appointmentsTodayChange,
          subtitle: "vs. mesma semana passada",
        },
        {
          icon: <Users className="w-5 h-5 text-primary" />,
          label: "Total de Pacientes",
          value: stats.totalPatients.toLocaleString("pt-BR"),
          change: stats.totalPatientsChange,
          subtitle: "vs. mês passado",
        },
        {
          icon: <DollarSign className="w-5 h-5 text-primary" />,
          label: "Receita Mensal",
          value: stats.monthlyRevenue.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          change: stats.monthlyRevenueChange,
          subtitle: "vs. mês passado",
        },
        {
          icon: <UserCheck className="w-5 h-5 text-primary" />,
          label: "Profissionais Ativos",
          value: stats.activeProfessionals.toString(),
          change: null,
          subtitle: null,
        },
      ]
    : [];

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Painel</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral da sua clínica
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loadingStats
          ? statSkeletonKeys.map((key) => <StatCardSkeleton key={key} />)
          : statCards.map((stat) => (
              <div
                key={stat.label}
                className="bg-card rounded-lg border border-border p-5 hover:border-border/80 transition-colors duration-200"
              >
                <div className="p-2 bg-primary/10 rounded-md w-fit mb-4">
                  {stat.icon}
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-foreground tabular-nums mb-3">
                  {stat.value}
                </p>
                {(stat.change !== null || stat.subtitle) && (
                  <div className="flex items-center gap-2 pt-3 border-t border-border">
                    <ChangeIndicator value={stat.change} />
                    {stat.subtitle && (
                      <span className="text-xs text-muted-foreground">
                        {stat.subtitle}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Ações rápidas
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.path}
              href={createTenantLink(tenant, action.path)}
            >
              <div className="bg-card rounded-lg border border-border p-5 hover:bg-accent transition-colors duration-150 cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                    {action.icon}
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-0.5">
                  {action.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Appointments */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Consultas recentes
          </p>
          <Link href={createTenantLink(tenant, "/dashboard/appointments")}>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary h-7 px-2 text-xs gap-1"
            >
              Ver todas <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Profissional
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Horário
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loadingAppointments ? (
                appointmentSkeletonRows.map((rowKey) => (
                  <tr key={rowKey}>
                    {appointmentSkeletonCells.map((cellKey) => (
                      <td key={cellKey} className="px-5 py-4">
                        <div className="h-3.5 bg-border rounded animate-pulse w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : recentAppointments.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-sm text-muted-foreground"
                  >
                    Nenhuma consulta no histórico ainda.
                  </td>
                </tr>
              ) : (
                recentAppointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="hover:bg-accent/60 transition-colors duration-150"
                  >
                    <td className="px-5 py-3.5 text-sm font-medium text-foreground">
                      {appointment.patientName ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">
                      {appointment.professionalName ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground tabular-nums">
                      {new Date(appointment.startAt).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      <AppointmentStatusBadge status={appointment.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
