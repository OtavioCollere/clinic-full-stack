"use client";

import { ClipboardList, Plus, Search, Stethoscope } from "lucide-react";
import { useRouter } from "next/navigation";
import { type MouseEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthContext } from "@/context/AuthContext";
import { useTenant } from "@/hooks/use-tenant";
import { createTenantLink } from "@/lib/tenant-navigation";
import { getPatients } from "@/services/patients/patients.service";

interface Patient {
  id: string;
  clinicId: string;
  userId: string;
  name: string;
  birthDay: string;
  address: string;
  zipCode: string;
  createdAt: string;
  updatedAt?: string | null;
  email?: string | null;
  cpf?: string | null;
  phone?: string | null;
  status?: "Medical Form Pending" | "Completed";
  franchiseName?: string;
  franchiseId?: string;
  isEmailVerified?: boolean;
  isAnamneseDone?: boolean;
  anamneseId?: string | null;
}

interface PatientsPageContentProps {
  portalBase: string;
  onPatientClick?: (patient: Patient) => void;
}

export default function PatientsPageContent({
  portalBase,
  onPatientClick,
}: PatientsPageContentProps) {
  const router = useRouter();
  const tenant = useTenant();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [franchiseFilter, setFranchiseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { user } = useAuthContext();

  useEffect(() => {
    if (!user?.clinicId) return;
    const fetchPatients = async () => {
      try {
        const response = await getPatients(user.clinicId as string, 1, 100);
        setPatients(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Erro ao buscar pacientes:", error);
        setPatients([]);
      }
    };
    fetchPatients();
  }, [user?.clinicId]);

  const filteredPatients = patients.filter((patient) => {
    const patientName = patient.name?.toLowerCase() || "";
    const patientEmail = patient.email?.toLowerCase() || "";
    const patientCpf = patient.cpf || "";
    const patientPhone = patient.phone || "";
    const matchesSearch =
      patientName.includes(searchTerm.toLowerCase()) ||
      patientEmail.includes(searchTerm.toLowerCase()) ||
      patientCpf.includes(searchTerm.toLowerCase()) ||
      patientPhone.includes(searchTerm.toLowerCase());
    const matchesFranchise =
      franchiseFilter === "all" || patient.franchiseName === franchiseFilter;
    const matchesStatus =
      statusFilter === "all" || patient.isEmailVerified === true;
    return matchesSearch && matchesFranchise && matchesStatus;
  });

  const uniqueFranchises = Array.from(
    new Set(patients.map((p) => p.franchiseName).filter(Boolean)),
  );
  const uniqueStatuses = Array.from(
    new Set(patients.map((p) => p.status).filter(Boolean)),
  );

  const getStatusColor = (status?: boolean) => {
    switch (status) {
      case true:
        return "bg-green-100 text-green-700";
      case false:
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-border text-foreground";
    }
  };

  const getAnamneseStatusColor = (isDone?: boolean) => {
    switch (isDone) {
      case true:
        return "bg-green-100 text-green-700";
      case false:
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-border text-foreground";
    }
  };

  const registerPath = createTenantLink(
    tenant,
    `${portalBase}/patients/register`,
  );

  const openPatientHistory = (
    event: MouseEvent<HTMLButtonElement>,
    patientId: string,
    tab: "procedimentos" | "anamnese",
  ) => {
    event.stopPropagation();
    router.push(
      createTenantLink(
        tenant,
        `${portalBase}/patients/${patientId}/history?tab=${tab}`,
      ),
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Pacientes</h1>
          <p className="text-muted-foreground">
            Gerencie o banco de dados e registros dos seus pacientes
          </p>
        </div>
        <Button
          onClick={() => router.push(registerPath)}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Paciente
        </Button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome, e-mail, telefone ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card border-border h-11"
          />
        </div>
        <div className="flex gap-4 flex-wrap">
          <Select value={franchiseFilter} onValueChange={setFranchiseFilter}>
            <SelectTrigger className="bg-card border-border h-10 w-48">
              <SelectValue placeholder="Filtrar por franquia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Franquias</SelectItem>
              {uniqueFranchises.map((franchise) => (
                <SelectItem key={franchise} value={franchise || ""}>
                  {franchise || "N/A"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-card border-border h-10 w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              {uniqueStatuses.map((status) => (
                <SelectItem key={status} value={status || ""}>
                  {status || "N/A"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="hidden xl:grid grid-cols-[minmax(180px,1.35fr)_minmax(130px,0.9fr)_minmax(190px,1.25fr)_minmax(120px,0.85fr)_minmax(120px,0.75fr)_minmax(115px,0.75fr)_220px] gap-4 p-6 border-b border-border bg-secondary">
          <div className="text-sm font-semibold text-foreground">
            Nome do Paciente
          </div>
          <div className="text-sm font-semibold text-foreground">Telefone</div>
          <div className="text-sm font-semibold text-foreground">E-mail</div>
          <div className="text-sm font-semibold text-foreground">Franquia</div>
          <div className="text-sm font-semibold text-foreground">
            Verificado
          </div>
          <div className="text-sm font-semibold text-foreground">Anamnese</div>
          <div className="text-sm font-semibold text-foreground">Ações</div>
        </div>

        {filteredPatients.length === 0 ? (
          <div className="p-12 text-center">
            <Search className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
            <p className="text-foreground font-medium mb-2">
              Nenhum paciente encontrado
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {patients.length === 0
                ? "Crie seu primeiro paciente para começar"
                : "Tente ajustar sua pesquisa ou filtros"}
            </p>
            <Button
              onClick={() => router.push(registerPath)}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Adicionar Paciente
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className="grid gap-4 p-4 transition-colors hover:bg-secondary/40 sm:p-5 xl:grid-cols-[minmax(180px,1.35fr)_minmax(130px,0.9fr)_minmax(190px,1.25fr)_minmax(120px,0.85fr)_minmax(120px,0.75fr)_minmax(115px,0.75fr)_220px] xl:items-center xl:p-6"
              >
                <div>
                  <span className="mb-1 block text-[11px] font-semibold uppercase text-muted-foreground xl:hidden">
                    Paciente
                  </span>
                  <button
                    type="button"
                    className="font-medium text-foreground text-sm text-left hover:text-primary transition-colors"
                    onClick={() => onPatientClick?.(patient)}
                  >
                    {patient.name || "N/A"}
                  </button>
                  <p className="text-xs text-muted-foreground">
                    {patient.cpf || "N/A"}
                  </p>
                </div>
                <div className="text-sm text-foreground">
                  <span className="mb-1 block text-[11px] font-semibold uppercase text-muted-foreground xl:hidden">
                    Telefone
                  </span>
                  {patient.phone || "N/A"}
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  <span className="mb-1 block text-[11px] font-semibold uppercase text-muted-foreground xl:hidden">
                    E-mail
                  </span>
                  {patient.email || "N/A"}
                </div>
                <div className="text-sm text-foreground">
                  <span className="mb-1 block text-[11px] font-semibold uppercase text-muted-foreground xl:hidden">
                    Franquia
                  </span>
                  {patient.franchiseName || "N/A"}
                </div>
                <div>
                  <span className="mb-1 block text-[11px] font-semibold uppercase text-muted-foreground xl:hidden">
                    Verificado
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${getStatusColor(
                      patient.isEmailVerified,
                    )}`}
                  >
                    {patient.isEmailVerified ? "Verificado" : "Não verificado"}
                  </span>
                </div>
                <div>
                  <span className="mb-1 block text-[11px] font-semibold uppercase text-muted-foreground xl:hidden">
                    Anamnese
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${getAnamneseStatusColor(
                      patient.isAnamneseDone,
                    )}`}
                  >
                    {patient.isAnamneseDone ? "Concluída" : "Pendente"}
                  </span>
                </div>
                <div>
                  <span className="mb-2 block text-[11px] font-semibold uppercase text-muted-foreground xl:hidden">
                    Ações
                  </span>
                  <div className="inline-flex h-9 w-full overflow-hidden rounded-md border border-border bg-card shadow-sm sm:w-auto">
                    <button
                      type="button"
                      className="inline-flex flex-1 items-center justify-center gap-1.5 px-3 text-xs font-medium text-foreground transition-colors hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none sm:flex-none"
                      onClick={(event) =>
                        openPatientHistory(event, patient.id, "anamnese")
                      }
                      title="Ver histórico de anamnese"
                    >
                      <ClipboardList className="h-3.5 w-3.5 text-primary" />
                      Anamnese
                    </button>
                    <div className="w-px bg-border" />
                    <button
                      type="button"
                      className="inline-flex flex-1 items-center justify-center gap-1.5 px-3 text-xs font-medium text-foreground transition-colors hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none sm:flex-none"
                      onClick={(event) =>
                        openPatientHistory(event, patient.id, "procedimentos")
                      }
                      title="Ver histórico de procedimentos"
                    >
                      <Stethoscope className="h-3.5 w-3.5 text-primary" />
                      Procedimentos
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {filteredPatients.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Mostrando {filteredPatients.length} de {patients.length} pacientes
        </div>
      )}
    </div>
  );
}
