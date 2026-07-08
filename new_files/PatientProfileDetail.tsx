import React from "react";
import DashboardWrapper from "@/components/DashboardWrapper";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnamnesisTimeline } from "@/components/PatientProfile/AnamnesisTimeline";
import { mockPatientProfile } from "@/data/patientProfileMockData";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Calendar, FileText, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PatientProfileDetail() {
  const navigate = useNavigate();
  const profile = mockPatientProfile;
  const patient = profile.patient;

  // Calculate age
  const today = new Date();
  const birthDate = new Date(patient.birthDate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

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

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return <Badge className="bg-blue-100 text-blue-800">Agendado</Badge>;
      case "DONE":
        return <Badge className="bg-green-100 text-green-800">Realizado</Badge>;
      case "CANCELED":
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      case "NO_SHOW":
        return <Badge className="bg-yellow-100 text-yellow-800">Não compareceu</Badge>;
      case "PAID":
        return <Badge className="bg-green-100 text-green-800">Pago</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Separate upcoming and past appointments
  const now = new Date();
  const upcomingAppointments = profile.appointments
    .filter((apt) => new Date(apt.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastAppointments = profile.appointments
    .filter((apt) => new Date(apt.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Combine and limit to last 6
  const displayedAppointments = [...upcomingAppointments, ...pastAppointments].slice(0, 6);

  return (
    <DashboardWrapper>
      <div className="space-y-6">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>

        {/* Patient Header */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {patient.name}
              </h1>
              <div className="flex items-center gap-6 text-foreground">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Idade:</span>
                  <span className="text-lg font-semibold">{age} anos</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">CPF:</span>
                  <span className="text-lg font-semibold">{patient.cpf}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Telefone:</span>
                  <span className="text-lg font-semibold">{patient.phone || "—"}</span>
                </div>
              </div>
            </div>

            {/* Revenue Badge */}
            <div className="bg-white rounded-lg p-6 border border-blue-200 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Receita Gerada
                </span>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(profile.totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN - Timeline */}
          <div className="lg:col-span-1">
            <div className="space-y-3 mb-4">
              <h2 className="text-2xl font-bold text-foreground">Histórico de Anamnese</h2>
              <p className="text-sm text-muted-foreground">
                Registro de alterações no histórico clínico do paciente
              </p>
            </div>
            <AnamnesisTimeline entries={profile.anamnesisHistory} />
          </div>

          {/* RIGHT COLUMN - Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appointments Card */}
            <Card className="p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">
                  Agendamentos Confirmados
                </h3>
              </div>

              <div className="space-y-3">
                {displayedAppointments.length > 0 ? (
                  displayedAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">
                          {formatDate(apt.date)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {apt.professionalName}
                        </p>
                        {apt.procedure && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {apt.procedure}
                          </p>
                        )}
                      </div>
                      <div className="ml-4">
                        {getStatusBadge(apt.status)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum agendamento encontrado
                  </p>
                )}
              </div>

              {displayedAppointments.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => console.log("Ver todos agendamentos")}
                >
                  Ver todos os agendamentos
                </Button>
              )}
            </Card>

            {/* Billing Records Card */}
            <Card className="p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">Comandas</h3>
              </div>

              <div className="space-y-3">
                {profile.billingRecords.length > 0 ? (
                  profile.billingRecords.slice(0, 8).map((billing) => (
                    <div
                      key={billing.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">
                          {formatDate(billing.date)}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {billing.procedures.map((proc, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {proc}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className="font-bold text-foreground">
                          {formatCurrency(billing.amount)}
                        </span>
                        {getStatusBadge(billing.status)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma comanda encontrada
                  </p>
                )}
              </div>

              {profile.billingRecords.length > 8 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => console.log("Ver todas comandas")}
                >
                  Ver todas as comandas
                </Button>
              )}
            </Card>

            {/* Patient Details Card */}
            <Card className="p-6 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Informações do Paciente
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Email
                  </p>
                  <p className="text-foreground mt-1">{patient.email}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Data de Nascimento
                  </p>
                  <p className="text-foreground mt-1">
                    {format(patient.birthDate, "dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Endereço
                  </p>
                  <p className="text-foreground mt-1">{patient.address || "Não informado"}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
}
