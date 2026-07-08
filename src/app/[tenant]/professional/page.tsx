"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AppointmentsList } from "../_components/appointment-list";
import ViewAppointmentDetailsModal from "../dashboard/_components/view-appointment-details-modal";
import { getAppointmentsByProfessionalId } from "@/services/appointments/appointment.service";
import { useAuthContext } from "@/context/AuthContext";
import type { PortalAppointment } from "@/types/portal";

type TabType = "active" | "history";

export default function ProfessionalAppointmentsPage() {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [appointments, setAppointments] = useState<PortalAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const professionalId = user?.professionalId;

  useEffect(() => {
    if (!professionalId) {
      setIsLoading(false);
      return;
    }
    const period = activeTab === "history" ? "history" : "active";
    const fetchAppointments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAppointmentsByProfessionalId(
          professionalId,
          period
        );
        setAppointments(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message ?? "Erro ao carregar agendamentos."
            : "Erro ao carregar agendamentos."
        );
        setAppointments([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAppointments();
  }, [professionalId, activeTab]);

  const handleViewDetails = (appointment: PortalAppointment) => {
    setSelectedAppointmentId(appointment.id);
    setShowDetailsModal(true);
  };

  if (!professionalId && !isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">
          Meus Agendamentos
        </h1>
        <p className="text-muted-foreground">
          Você não possui vínculo como profissional nesta clínica.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Meus Agendamentos
        </h1>
        <p className="text-muted-foreground mt-2">
          Visualize seus agendamentos e histórico de consultas
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        <Button
          variant={activeTab === "active" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("active")}
        >
          Ativos
        </Button>
        <Button
          variant={activeTab === "history" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("history")}
        >
          Histórico
        </Button>
      </div>

      <div className="space-y-4">
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <AppointmentsList
          appointments={appointments}
          role="PROFESSIONAL"
          isLoading={isLoading}
          onViewDetails={handleViewDetails}
          emptyMessage={
            activeTab === "active"
              ? "Você não possui agendamentos marcados."
              : "Nenhum agendamento anterior."
          }
        />
      </div>

      <ViewAppointmentDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedAppointmentId(null);
        }}
        appointmentId={selectedAppointmentId ?? ""}
      />
    </div>
  );
}
