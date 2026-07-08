"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import AppointmentsPageContent from "@/app/[tenant]/_components/appointments-page-content";

export default function ProfessionalAppointmentsPage() {
  const { user } = useAuthContext();
  const [onlyMine, setOnlyMine] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Consultas</h1>
          <p className="text-muted-foreground text-sm">
            Agenda da clínica — edite apenas suas próprias consultas
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOnlyMine((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            onlyMine
              ? "bg-primary text-white border-primary"
              : "bg-card text-foreground border-border hover:bg-accent"
          }`}
        >
          <User className="w-4 h-4" />
          Minhas consultas
        </button>
      </div>

      <AppointmentsPageContent
        portalBase="/professional"
        ownProfessionalId={user?.professionalId}
        filterProfessionalId={onlyMine ? user?.professionalId : undefined}
        hideTitle
        simplified
      />
    </div>
  );
}
