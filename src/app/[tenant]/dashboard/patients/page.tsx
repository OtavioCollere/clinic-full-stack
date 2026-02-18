"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus } from "lucide-react";
import { useTenant } from "@/hooks/use-tenant";
import { createTenantLink } from "@/lib/tenant-navigation";
import { getPatients } from "@/services/patients/patients.service";
import { useAuthContext } from "@/context/AuthContext";

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
  // Campos adicionais que podem vir da API ou serem mapeados
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

export default function PatientsManagement() {
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
        // A API retorna um array diretamente
        setPatients(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Erro ao buscar pacientes:", error);
        setPatients([]);
      }
    };

    fetchPatients();
  }, [user?.clinicId]);

  // Filtra pacientes baseado na busca e filtros
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

    const matchesFranchise = franchiseFilter === "all" || patient.franchiseName === franchiseFilter;
    const matchesStatus = statusFilter === "all" || patient.isEmailVerified === true;

    return matchesSearch && matchesFranchise && matchesStatus;
  });

  const uniqueFranchises = Array.from(
    new Set(patients.map((p) => p.franchiseName).filter(Boolean))
  );
  const uniqueStatuses = Array.from(
    new Set(patients.map((p) => p.status).filter(Boolean))
  );

  const getStatusColor = (status?: boolean) => {
    switch (status) {
      case true:
        return "bg-green-100 text-green-700";
      case false:
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getAnamneseStatusColor = (isDone?: boolean) => {
    switch (isDone) {
      case true:
        return "bg-green-100 text-green-700";
      case false:
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Pacientes</h1>
            <p className="text-muted-foreground">Gerencie o banco de dados e registros dos seus pacientes</p>
          </div>
          <Button
            onClick={() => router.push(createTenantLink(tenant, "/dashboard/patients/register"))}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Paciente
          </Button>
        </div>

        {/* Search and Filters Section */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por nome, e-mail, telefone ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-border h-11"
            />
          </div>

          {/* Filters Row */}
          <div className="flex gap-4 flex-wrap">
            <Select value={franchiseFilter} onValueChange={setFranchiseFilter}>
              <SelectTrigger className="bg-white border-border h-10 w-48">
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
              <SelectTrigger className="bg-white border-border h-10 w-48">
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

        {/* Table Structure Container */}
        <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
          {/* Table Header - Structured for future table component */}
          <div className="grid grid-cols-6 gap-4 p-6 border-b border-border bg-secondary">
            <div className="text-sm font-semibold text-foreground">Nome do Paciente</div>
            <div className="text-sm font-semibold text-foreground">Telefone</div>
            <div className="text-sm font-semibold text-foreground">E-mail</div>
            <div className="text-sm font-semibold text-foreground">Franquia</div>
            <div className="text-sm font-semibold text-foreground">Verificado</div>
            <div className="text-sm font-semibold text-foreground">Anamnese</div>
          </div>

          {/* Table Content - Placeholder structure */}
          {filteredPatients.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-muted-foreground mb-3 opacity-50">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-foreground font-medium mb-2">Nenhum paciente encontrado</p>
              <p className="text-sm text-muted-foreground mb-6">
                {patients.length === 0
                  ? "Crie seu primeiro paciente para começar"
                  : "Tente ajustar sua pesquisa ou filtros"}
              </p>
              <Button
                onClick={() => router.push(createTenantLink(tenant, "/dashboard/patients/register"))}
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
                  className="grid grid-cols-6 gap-4 p-6 items-center hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-medium text-foreground text-sm">{patient.name || "N/A"}</p>
                    <p className="text-xs text-muted-foreground">{patient.cpf || "N/A"}</p>
                  </div>
                  <div className="text-sm text-foreground">{patient.phone || "N/A"}</div>
                  <div className="text-sm text-muted-foreground truncate">{patient.email || "N/A"}</div>
                  <div className="text-sm text-foreground">{patient.franchiseName || "N/A"}</div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${getStatusColor(patient.isEmailVerified)}`}>
                      {patient.isEmailVerified ? "Verificado" : "Não verificado"}
                    </span>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${getAnamneseStatusColor(patient.isAnamneseDone)}`}>
                      {patient.isAnamneseDone ? "Concluída" : "Pendente"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results Footer */}
        {filteredPatients.length > 0 && (
          <div className="text-sm text-muted-foreground text-center">
            Mostrando {filteredPatients.length} de {patients.length} pacientes
          </div>
        )}
      </div>

  );
}
