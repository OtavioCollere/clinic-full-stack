import React, { useState, useMemo } from "react";
import DashboardWrapper from "@/components/DashboardWrapper";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockBillingRecords, allProcedures } from "@/data/billingMockData";
import { BillingRecord, BillingFilters } from "@/types/billing";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, X } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function Comandas() {
  const [filters, setFilters] = useState<BillingFilters>({});
  const [currentPage, setCurrentPage] = useState(1);

  // Filter form state
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [patientNameSearch, setPatientNameSearch] = useState("");
  const [procedureFilter, setProcedureFilter] = useState("__ALL__");

  // Apply filters
  const filteredRecords = useMemo(() => {
    return mockBillingRecords.filter((record) => {
      // Date range filter
      if (startDate && new Date(startDate) > record.date) return false;
      if (endDate && new Date(endDate) < record.date) return false;

      // Patient name filter (case-insensitive)
      if (patientNameSearch && !record.patientName.toLowerCase().includes(patientNameSearch.toLowerCase())) {
        return false;
      }

      // Procedure filter (skip if set to __ALL__)
      if (procedureFilter && procedureFilter !== "__ALL__" && !record.procedures.includes(procedureFilter)) {
        return false;
      }

      return true;
    });
  }, [startDate, endDate, patientNameSearch, procedureFilter]);

  // Calculate totals
  const totalBilled = filteredRecords.reduce((sum, record) => sum + record.amount, 0);
  const totalPaid = filteredRecords.filter((r) => r.status === "PAID").reduce((sum, record) => sum + record.amount, 0);
  const totalPending = filteredRecords.filter((r) => r.status === "PENDING").reduce((sum, record) => sum + record.amount, 0);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Handle clear filters
  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setPatientNameSearch("");
    setProcedureFilter("__ALL__");
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = startDate || endDate || patientNameSearch || (procedureFilter && procedureFilter !== "__ALL__");

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Format date
  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy");
  };

  // Get status badge color and label
  const getStatusDisplay = (status: string) => {
    if (status === "PAID") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Pago
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
        Aguardando
      </Badge>
    );
  };

  // Get payment method display
  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "PIX":
        return "PIX";
      case "CARD":
        return "Cartão";
      case "CASH":
        return "Dinheiro";
      default:
        return method;
    }
  };

  return (
    <DashboardWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Comandas</h1>
          <p className="text-muted-foreground">Visualize e gerencie os registros de faturamento da clínica</p>
        </div>

        {/* Summary Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <p className="text-sm text-muted-foreground font-medium mb-1">Total Faturado</p>
            <p className="text-3xl font-bold text-blue-900">{formatCurrency(totalBilled)}</p>
            <p className="text-xs text-blue-700 mt-2">{filteredRecords.length} registros</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <p className="text-sm text-muted-foreground font-medium mb-1">Pagos</p>
            <p className="text-3xl font-bold text-green-900">{formatCurrency(totalPaid)}</p>
            <p className="text-xs text-green-700 mt-2">
              {filteredRecords.filter((r) => r.status === "PAID").length} pagos
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <p className="text-sm text-muted-foreground font-medium mb-1">Pendentes</p>
            <p className="text-3xl font-bold text-amber-900">{formatCurrency(totalPending)}</p>
            <p className="text-xs text-amber-700 mt-2">
              {filteredRecords.filter((r) => r.status === "PENDING").length} pendentes
            </p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Filtros</h3>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <X className="w-4 h-4 mr-1" />
                  Limpar Filtros
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="start-date" className="text-sm">
                  Data Início
                </Label>
                <div className="relative">
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-10 bg-white"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="end-date" className="text-sm">
                  Data Fim
                </Label>
                <div className="relative">
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-10 bg-white"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Patient Name Search */}
              <div className="space-y-2">
                <Label htmlFor="patient-search" className="text-sm">
                  Paciente
                </Label>
                <Input
                  id="patient-search"
                  type="text"
                  placeholder="Pesquisar nome..."
                  value={patientNameSearch}
                  onChange={(e) => {
                    setPatientNameSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10 bg-white"
                />
              </div>

              {/* Procedure Filter */}
              <div className="space-y-2">
                <Label htmlFor="procedure-select" className="text-sm">
                  Procedimento
                </Label>
                <Select value={procedureFilter} onValueChange={(value) => {
                  setProcedureFilter(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger id="procedure-select" className="h-10 bg-white">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__ALL__">Todos</SelectItem>
                    {allProcedures.map((proc) => (
                      <SelectItem key={proc} value={proc}>
                        {proc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Data Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="border-border hover:bg-slate-50">
                  <TableHead className="text-foreground font-semibold w-24">Data</TableHead>
                  <TableHead className="text-foreground font-semibold">Paciente</TableHead>
                  <TableHead className="text-foreground font-semibold">Procedimentos</TableHead>
                  <TableHead className="text-foreground font-semibold w-32">Forma de Pagamento</TableHead>
                  <TableHead className="text-foreground font-semibold w-32">Status</TableHead>
                  <TableHead className="text-foreground font-semibold text-right w-32">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRecords.length > 0 ? (
                  paginatedRecords.map((record) => (
                    <TableRow key={record.id} className="border-border hover:bg-slate-50 transition-colors">
                      <TableCell className="text-sm text-foreground font-medium">
                        {formatDate(record.date)}
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {record.patientName}
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        <div className="flex flex-wrap gap-1">
                          {record.procedures.map((proc, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {proc}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {getPaymentMethodLabel(record.paymentMethod)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getStatusDisplay(record.status)}
                      </TableCell>
                      <TableCell className="text-sm font-bold text-foreground text-right">
                        {formatCurrency(record.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum registro encontrado com os filtros selecionados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-slate-50 px-6 py-4 border-t border-border flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(startIndex + ITEMS_PER_PAGE, filteredRecords.length)} de{" "}
                {filteredRecords.length} registros
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-10 h-10 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardWrapper>
  );
}
