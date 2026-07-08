import React from "react";
import DashboardWrapper from "@/components/DashboardWrapper";
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
import { mockFinancialDashboard } from "@/data/financialMockData";
import { TrendingUp, TrendingDown, Users } from "lucide-react";

export default function FinancialDashboard() {
  const data = mockFinancialDashboard;

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <DashboardWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Financeiro</h1>
          <p className="text-muted-foreground">
            Acompanhe o desempenho financeiro da clínica
          </p>
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
                    {formatCurrency(data.currentMonthRevenue)}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    data.revenueGrowthPercent >= 0
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                >
                  {data.revenueGrowthPercent >= 0 ? (
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
                    data.revenueGrowthPercent >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {data.revenueGrowthPercent >= 0 ? "+" : ""}
                  {data.revenueGrowthPercent.toFixed(1)}% (
                  {formatCurrency(
                    data.currentMonthRevenue - data.lastMonthRevenue
                  )})
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
                    {data.newPatientsThisMonth}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <p className="text-xs text-muted-foreground">vs. mês anterior</p>
                <p className="text-sm font-semibold mt-1 text-green-600">
                  +{data.newPatientsGrowthPercent.toFixed(1)}% (
                  {data.newPatientsThisMonth - data.newPatientsLastMonth} novos)
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="space-y-6">
          {/* Full Width - Monthly Revenue */}
          <Card className="p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              Receita por Mês
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={data.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="monthName"
                  stroke="#94a3b8"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="#94a3b8"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) =>
                    `R$ ${(value / 1000).toFixed(0)}k`
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => formatCurrency(value as number)}
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
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Two Column Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart - Top Procedures */}
            <Card className="p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-6">
                Procedimentos Mais Realizados
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={data.topProcedures}
                  layout="vertical"
                  margin={{ left: 150, right: 20, top: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#94a3b8" style={{ fontSize: "12px" }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#94a3b8"
                    style={{ fontSize: "11px" }}
                    width={140}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [value, "Total"]}
                  />
                  <Bar
                    dataKey="count"
                    fill="#06b6d4"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Area Chart - Returning Patients */}
            <Card className="p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-6">
                Pacientes que Retornaram
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.returningPatientsMonthly}>
                  <defs>
                    <linearGradient id="colorReturning" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="monthName"
                    stroke="#94a3b8"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    style={{ fontSize: "12px" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [value, "Pacientes"]}
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
    </DashboardWrapper>
  );
}
