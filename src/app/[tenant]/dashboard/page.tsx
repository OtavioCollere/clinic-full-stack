"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTenant } from "@/hooks/use-tenant";
import { createTenantLink } from "@/lib/tenant-navigation";
import {
  Calendar,
  Users,
  DollarSign,
  UserCheck,
  Plus,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
interface StatCard {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: string;
  changeType?: "up" | "down";
}

const stats: StatCard[] = [
  {
    icon: <Calendar className="w-6 h-6 text-primary" />,
    label: "Consultas de Hoje",
    value: "12",
    change: "+20% em relação à semana passada",
    changeType: "up",
  },
  {
    icon: <Users className="w-6 h-6 text-primary" />,
    label: "Total de Pacientes",
    value: "1,284",
    change: "+45% em relação ao mês passado",
    changeType: "up",
  },
  {
    icon: <DollarSign className="w-6 h-6 text-primary" />,
    label: "Receita Mensal",
    value: "$45,231",
    change: "+12% em relação ao mês passado",
    changeType: "up",
  },
  {
    icon: <UserCheck className="w-6 h-6 text-primary" />,
    label: "Profissionais Ativos",
    value: "8",
    change: "Todos disponíveis hoje",
    changeType: "up",
  },
];

const quickActions = [
  {
    icon: <Calendar className="w-5 h-5" />,
    label: "Nova Consulta",
    path: "/dashboard/appointments/register",
    description: "Agendar uma nova consulta",
  },
  {
    icon: <Users className="w-5 h-5" />,
    label: "Novo Paciente",
    path: "/dashboard/patients/register",
    description: "Adicionar um novo paciente à sua clínica",
  },
  {
    icon: <UserCheck className="w-5 h-5" />,
    label: "Adicionar Membro",
    path: "/dashboard/members/register",
    description: "Convidar um novo membro da equipe",
  },
];

export default function DashboardPage() {
  const tenant = useTenant();

  return (
    <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Painel</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao seu sistema de gestão de clínica. Aqui está uma visão geral da sua prática.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 bg-blue-50 rounded-lg">{stat.icon}</div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-foreground mb-3">{stat.value}</h3>
              {stat.change && (
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp
                    className={`w-4 h-4 ${
                      stat.changeType === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      stat.changeType === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={createTenantLink(tenant, action.path)}>
                <div className="bg-white rounded-xl border border-border p-6 hover:shadow-lg hover:border-primary transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 bg-blue-50 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      {action.icon}
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{action.label}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Consultas Recentes</h2>
            <Link href={createTenantLink(tenant, "/dashboard/appointments")}>
              <Button variant="ghost" className="text-primary">
                Ver Todas <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Profissional
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Horário
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    patient: "Sarah Anderson",
                    professional: "Dr. John Smith",
                    time: "10:00",
                    status: "Confirmada",
                  },
                  {
                    patient: "Michael Johnson",
                    professional: "Dr. Maria Garcia",
                    time: "11:30",
                    status: "Pendente",
                  },
                  {
                    patient: "Emily Brown",
                    professional: "Dr. John Smith",
                    time: "14:00",
                    status: "Concluída",
                  },
                ].map((appointment, index) => (
                  <tr key={index} className="border-b border-border hover:bg-secondary/50">
                    <td className="px-6 py-4 text-sm text-foreground">
                      {appointment.patient}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {appointment.professional}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {appointment.time}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          appointment.status === "Confirmada"
                            ? "bg-green-100 text-green-700"
                            : appointment.status === "Pendente"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
}
