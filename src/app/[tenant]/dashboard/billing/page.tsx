"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, CalendarDays, DollarSign, CheckCircle2, Sparkles } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import {
  getAppointmentHistoryByClinicId,
  type Appointment,
} from "@/services/appointments/appointment.service";
import { getProceduresByClinicId } from "@/services/procedures/procedure.service";

const ITEMS_PER_PAGE = 15;

type QuickPeriod = "1m" | "3m" | "6m" | "custom";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function toISO(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getPeriodDates(period: QuickPeriod): { start: string; end: string } {
  const today = new Date();
  const end = toISO(today);
  if (period === "1m") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return { start: toISO(start), end };
  }
  if (period === "3m") {
    const start = new Date(today.getFullYear(), today.getMonth() - 2, 1);
    return { start: toISO(start), end };
  }
  if (period === "6m") {
    const start = new Date(today.getFullYear(), today.getMonth() - 5, 1);
    return { start: toISO(start), end };
  }
  return { start: "", end: "" };
}

function formatPeriodLabel(startDate: string, endDate: string): string {
  if (!startDate && !endDate) return "Todo o período";
  const fmt = (d: string) =>
    new Date(d + "T12:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  if (startDate && endDate) return `${fmt(startDate)} → ${fmt(endDate)}`;
  if (startDate) return `A partir de ${fmt(startDate)}`;
  return `Até ${fmt(endDate)}`;
}

export default function BillingPage() {
  const { user } = useAuthContext();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [procedureMap, setProcedureMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quickPeriod, setQuickPeriod] = useState<QuickPeriod>("1m");
  const [startDate, setStartDate] = useState(() => getPeriodDates("1m").start);
  const [endDate, setEndDate] = useState(() => getPeriodDates("1m").end);
  const [patientSearch, setPatientSearch] = useState("");
  const [procedureFilter, setProcedureFilter] = useState("__ALL__");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user?.clinicId) return;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [historyRes, procsRes] = await Promise.all([
          getAppointmentHistoryByClinicId(user.clinicId as string, 1, 1000),
          getProceduresByClinicId(user.clinicId as string),
        ]);
        const done = Array.isArray(historyRes?.items)
          ? historyRes.items.filter((a) => a.status === "DONE")
          : [];
        setAppointments(done);
        const map: Record<string, string> = {};
        if (Array.isArray(procsRes)) {
          procsRes.forEach((p: { id: string; name: string }) => {
            map[p.id] = p.name;
          });
        }
        setProcedureMap(map);
      } catch (err: any) {
        setError(err?.response?.data?.message ?? "Erro ao carregar comandas.");
        setAppointments([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?.clinicId]);

  const handleQuickPeriod = (period: QuickPeriod) => {
    setQuickPeriod(period);
    if (period !== "custom") {
      const { start, end } = getPeriodDates(period);
      setStartDate(start);
      setEndDate(end);
    }
    setCurrentPage(1);
  };

  const handleDateChange = (field: "start" | "end", value: string) => {
    if (field === "start") setStartDate(value);
    else setEndDate(value);
    setQuickPeriod("custom");
    setCurrentPage(1);
  };

  const allProcedureNames = useMemo(() => {
    const names = new Set<string>();
    appointments.forEach((apt) =>
      apt.appointmentItems.forEach((item) => {
        const name = procedureMap[item.procedureId];
        if (name) names.add(name);
      })
    );
    return Array.from(names).sort();
  }, [appointments, procedureMap]);

  const filteredOrders = useMemo(() => {
    return appointments.filter((apt) => {
      const date = new Date(apt.startAt).toISOString().slice(0, 10);
      if (startDate && date < startDate) return false;
      if (endDate && date > endDate) return false;
      if (
        patientSearch &&
        !apt.patientName?.toLowerCase().includes(patientSearch.toLowerCase())
      )
        return false;
      if (procedureFilter !== "__ALL__") {
        const hasProc = apt.appointmentItems.some(
          (item) => procedureMap[item.procedureId] === procedureFilter
        );
        if (!hasProc) return false;
      }
      return true;
    });
  }, [appointments, startDate, endDate, patientSearch, procedureFilter, procedureMap]);

  const totalBilled = filteredOrders.reduce(
    (sum, apt) =>
      sum + apt.appointmentItems.reduce((s, i) => s + Number(i.price || 0), 0),
    0
  );
  const totalCount = filteredOrders.length;
  const totalProcedures = filteredOrders.reduce(
    (sum, apt) => sum + apt.appointmentItems.length,
    0
  );

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const hasActiveFilters =
    patientSearch || procedureFilter !== "__ALL__";

  const handleClearFilters = () => {
    setPatientSearch("");
    setProcedureFilter("__ALL__");
    setCurrentPage(1);
  };

  const periodLabel = formatPeriodLabel(startDate, endDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Comandas</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{periodLabel}</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border border-border p-5">
          <div className="p-2 bg-primary/10 rounded-md w-fit mb-4">
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground mb-1">Total Faturado</p>
          <p className="text-2xl font-bold text-foreground tabular-nums">{formatCurrency(totalBilled)}</p>
          <p className="text-xs text-muted-foreground mt-2">{totalCount} consultas no período</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-5">
          <div className="p-2 bg-emerald-500/10 rounded-md w-fit mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xs text-muted-foreground mb-1">Consultas Pagas</p>
          <p className="text-2xl font-bold text-foreground tabular-nums">{totalCount}</p>
          <p className="text-xs text-muted-foreground mt-2">confirmadas e concluídas</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-5">
          <div className="p-2 bg-primary/10 rounded-md w-fit mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground mb-1">Procedimentos</p>
          <p className="text-2xl font-bold text-foreground tabular-nums">{totalProcedures}</p>
          <p className="text-xs text-muted-foreground mt-2">realizados no período</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-5">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground text-sm">Filtros</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-destructive hover:bg-destructive/10 h-8 text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Limpar
              </Button>
            )}
          </div>

          {/* Quick period switches */}
          <div className="space-y-1.5">
            <Label className="text-xs">Período</Label>
            <div className="flex gap-2 flex-wrap">
              {(
                [
                  { key: "1m", label: "Mês atual" },
                  { key: "3m", label: "3 meses" },
                  { key: "6m", label: "6 meses" },
                  { key: "custom", label: "Personalizado" },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleQuickPeriod(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    quickPeriod === key
                      ? "bg-primary text-white border-primary"
                      : "bg-card border-border text-foreground hover:bg-accent"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Date inputs — always visible, editable */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="start-date" className="text-xs">Data Início</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => handleDateChange("start", e.target.value)}
                className="h-9 bg-card text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end-date" className="text-xs">Data Fim</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => handleDateChange("end", e.target.value)}
                className="h-9 bg-card text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="patient-search" className="text-xs">Paciente</Label>
              <Input
                id="patient-search"
                type="text"
                placeholder="Pesquisar nome..."
                value={patientSearch}
                onChange={(e) => { setPatientSearch(e.target.value); setCurrentPage(1); }}
                className="h-9 bg-card text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proc-filter" className="text-xs">Procedimento</Label>
              <Select
                value={procedureFilter}
                onValueChange={(v) => { setProcedureFilter(v); setCurrentPage(1); }}
              >
                <SelectTrigger id="proc-filter" className="h-9 bg-card text-sm">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__ALL__">Todos</SelectItem>
                  {allProcedureNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28">
                Data
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Paciente
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Profissional
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Procedimentos
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide w-32">
                Valor
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-5 py-3.5">
                      <div className="h-3.5 bg-border rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-destructive">
                  {error}
                </td>
              </tr>
            ) : paginated.length > 0 ? (
              paginated.map((apt) => {
                const total = apt.appointmentItems.reduce(
                  (sum, i) => sum + Number(i.price || 0),
                  0
                );
                return (
                  <tr
                    key={apt.id}
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-sm text-foreground font-medium">
                      {formatDate(apt.startAt)}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-foreground">
                      {apt.patientName ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">
                      {apt.professionalName ?? "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {apt.appointmentItems.map((item, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs font-normal">
                            {procedureMap[item.procedureId] ?? "Procedimento"}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-bold text-foreground text-right">
                      {formatCurrency(total)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">
                  Nenhuma comanda encontrada{" "}
                  {startDate || endDate
                    ? `em ${periodLabel.toLowerCase()}`
                    : ""}
                  {hasActiveFilters ? " com os filtros selecionados" : ""}.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {!isLoading && !error && totalPages > 1 && (
          <div className="bg-muted/40 px-5 py-3.5 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filteredOrders.length)} de{" "}
              {filteredOrders.length} registros
            </p>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-8 text-xs"
              >
                Anterior
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="h-8 w-8 p-0 text-xs"
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="h-8 text-xs"
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
