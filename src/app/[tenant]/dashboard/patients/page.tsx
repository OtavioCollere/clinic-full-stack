"use client";

import { useState } from "react";
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

interface Patient {
  id: string;
  fullName: string;
  cpf: string;
  phone: string;
  email: string;
  status: "Medical Form Pending" | "Completed";
  franchise: string;
}

const mockPatients: Patient[] = [
  {
    id: "1",
    fullName: "Sarah Anderson",
    cpf: "123.456.789-00",
    phone: "(11) 98765-4321",
    email: "sarah@email.com",
    status: "Completed",
    franchise: "Downtown Unit",
  },
  {
    id: "2",
    fullName: "Michael Johnson",
    cpf: "987.654.321-11",
    phone: "(11) 99876-5432",
    email: "michael@email.com",
    status: "Medical Form Pending",
    franchise: "Uptown Unit",
  },
  {
    id: "3",
    fullName: "Emily Brown",
    cpf: "456.789.123-22",
    phone: "(11) 97654-3210",
    email: "emily@email.com",
    status: "Completed",
    franchise: "Downtown Unit",
  },
  {
    id: "4",
    fullName: "James Wilson",
    cpf: "789.123.456-33",
    phone: "(11) 96543-2109",
    email: "james@email.com",
    status: "Medical Form Pending",
    franchise: "Shopping Mall Unit",
  },
  {
    id: "5",
    fullName: "Lisa Martinez",
    cpf: "321.654.987-44",
    phone: "(11) 95432-1098",
    email: "lisa@email.com",
    status: "Completed",
    franchise: "Uptown Unit",
  },
];

export default function PatientsManagement() {
  const router = useRouter();
  const [patients] = useState<Patient[]>(mockPatients);
  const [searchTerm, setSearchTerm] = useState("");
  const [franchiseFilter, setFranchiseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.cpf.includes(searchTerm) ||
      patient.phone.includes(searchTerm) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFranchise = franchiseFilter === "all" || patient.franchise === franchiseFilter;
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter;

    return matchesSearch && matchesFranchise && matchesStatus;
  });

  const uniqueFranchises = Array.from(new Set(patients.map((p) => p.franchise)));
  const uniqueStatuses = Array.from(new Set(patients.map((p) => p.status)));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Medical Form Pending":
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
            onClick={() => router.push("/dashboard/patients/register")}
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
                  <SelectItem key={franchise} value={franchise}>
                    {franchise}
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
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table Structure Container */}
        <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
          {/* Table Header - Structured for future table component */}
          <div className="grid grid-cols-5 gap-4 p-6 border-b border-border bg-secondary">
            <div className="text-sm font-semibold text-foreground">Nome do Paciente</div>
            <div className="text-sm font-semibold text-foreground">Telefone</div>
            <div className="text-sm font-semibold text-foreground">E-mail</div>
            <div className="text-sm font-semibold text-foreground">Franquia</div>
            <div className="text-sm font-semibold text-foreground">Status</div>
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
                onClick={() => router.push("/dashboard/patients/register")}
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
                  className="grid grid-cols-5 gap-4 p-6 items-center hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-medium text-foreground text-sm">{patient.fullName}</p>
                    <p className="text-xs text-muted-foreground">{patient.cpf}</p>
                  </div>
                  <div className="text-sm text-foreground">{patient.phone}</div>
                  <div className="text-sm text-muted-foreground truncate">{patient.email}</div>
                  <div className="text-sm text-foreground">{patient.franchise}</div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${getStatusColor(patient.status)}`}>
                      {patient.status}
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
