"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AppointmentsList } from "../_components/appointment-list";
import ViewAppointmentDetailsModal from "../dashboard/_components/view-appointment-details-modal";
import { getAppointmentsByPatientId } from "@/services/appointments/appointment.service";
import { useAuthContext } from "@/context/AuthContext";
import type { PortalAppointment } from "@/types/portal";

type TabType = "active" | "history";

export default function PatientAppointmentsPage() {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [appointments, setAppointments] = useState<PortalAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const patientId = user?.patientId;

  useEffect(() => {
    if (!patientId) {
      setIsLoading(false);
      return;
    }
    const period = activeTab === "history" ? "history" : "active";
    const fetchAppointments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAppointmentsByPatientId(patientId, period);
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
  }, [patientId, activeTab]);

  const handleViewDetails = (appointment: PortalAppointment) => {
    setSelectedAppointmentId(appointment.id);
    setShowDetailsModal(true);
  };

  if (!patientId && !isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Meus Agendamentos</h1>
        <p className="text-muted-foreground">
          Você não possui vínculo como paciente nesta clínica.
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
          Visualize seus agendamentos e histórico
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
          role="PATIENT"
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
