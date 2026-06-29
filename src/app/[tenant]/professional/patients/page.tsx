"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, Users, ClipboardList, Stethoscope } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useTenant } from "@/hooks/use-tenant";
import { createTenantLink } from "@/lib/tenant-navigation";
import { getPatientsByProfessionalId, type PatientResponse } from "@/services/patients/patients.service";
import { toast } from "sonner";

function calcAge(birthDay: string) {
  const diff = Date.now() - new Date(birthDay).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export default function ProfessionalPatientsPage() {
  const { user } = useAuthContext();
  const tenant = useTenant();
  const router = useRouter();
  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.professionalId) return;
    getPatientsByProfessionalId(user.professionalId)
      .then((data) => setPatients(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Erro ao carregar pacientes"))
      .finally(() => setIsLoading(false));
  }, [user?.professionalId]);

  const filtered = patients.filter((p) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Meus Pacientes</h1>
        <p className="text-muted-foreground">Pacientes que já tiveram consulta com você</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar paciente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando pacientes...</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && filtered.length === 0 && (
        <div className="bg-card rounded-xl border border-dashed border-border p-12 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
          <p className="text-foreground font-medium mb-2">
            {searchTerm ? "Nenhum paciente encontrado" : "Nenhum paciente ainda"}
          </p>
          <p className="text-sm text-muted-foreground">
            {searchTerm
              ? "Tente outro termo de busca"
              : "Os pacientes aparecem aqui após a primeira consulta"}
          </p>
        </div>
      )}

      {/* Patient list */}
      {!isLoading && filtered.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Table header — desktop only */}
          <div className="hidden xl:grid grid-cols-[1.5fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b bg-secondary text-xs font-semibold uppercase text-muted-foreground">
            <span>Paciente</span>
            <span>Endereço</span>
            <span>Telefone</span>
            <span className="w-36">Histórico</span>
          </div>

          <div className="divide-y divide-border">
            {filtered.map((patient) => (
              <div
                key={patient.id}
                className="grid gap-3 p-4 xl:grid-cols-[1.5fr_1fr_1fr_auto] xl:items-center"
              >
                {/* Name + age */}
                <div>
                  <span className="mb-1 block text-[11px] font-semibold uppercase text-muted-foreground xl:hidden">
                    Paciente
                  </span>
                  <p className="font-medium text-foreground">{patient.name}</p>
                  {patient.birthDay && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {calcAge(patient.birthDay)} anos
                    </p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <span className="mb-1 block text-[11px] font-semibold uppercase text-muted-foreground xl:hidden">
                    Endereço
                  </span>
                  <p className="text-sm text-foreground truncate">{patient.address || "—"}</p>
                </div>

                {/* Phone */}
                <div>
                  <span className="mb-1 block text-[11px] font-semibold uppercase text-muted-foreground xl:hidden">
                    Telefone
                  </span>
                  <p className="text-sm text-foreground">
                    {(patient as { phone?: string }).phone || "—"}
                  </p>
                </div>

                {/* Actions */}
                <div className="xl:w-36">
                  <div className="inline-flex h-9 overflow-hidden rounded-md border border-border bg-card">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          createTenantLink(tenant, `/dashboard/patients/${patient.id}/history?tab=anamnese`)
                        )
                      }
                      className="flex items-center gap-1.5 px-3 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      title="Anamnese"
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Anamnese</span>
                    </button>
                    <div className="w-px bg-border" />
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          createTenantLink(tenant, `/dashboard/patients/${patient.id}/history`)
                        )
                      }
                      className="flex items-center gap-1.5 px-3 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      title="Procedimentos"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Histórico</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
