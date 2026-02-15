"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../_components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Edit2, Lock } from "lucide-react";

interface Professional {
  id: string;
  name: string;
  profession: string;
  council: string;
  councilNumber: string;
  franchise: string;
  status: "active" | "disabled";
}

const mockProfessionals: Professional[] = [
  {
    id: "1",
    name: "Dr. John Smith",
    profession: "Dentist",
    council: "CRO",
    councilNumber: "12345",
    franchise: "Downtown Unit",
    status: "active",
  },
  {
    id: "2",
    name: "Dr. Maria Garcia",
    profession: "Physician",
    council: "CRM",
    councilNumber: "54321",
    franchise: "Downtown Unit",
    status: "active",
  },
  {
    id: "3",
    name: "Dr. Robert Johnson",
    profession: "Dentist",
    council: "CRO",
    councilNumber: "67890",
    franchise: "Uptown Unit",
    status: "active",
  },
  {
    id: "4",
    name: "Dr. Sarah Williams",
    profession: "Therapist",
    council: "CREF",
    councilNumber: "11111",
    franchise: "Shopping Mall Unit",
    status: "disabled",
  },
];

export default function ProfessionalsPage() {
  const router = useRouter();
  const [professionals, setProfessionals] = useState<Professional[]>(mockProfessionals);
  const [searchTerm, setSearchTerm] = useState("");
  const [franchiseFilter, setFranchiseFilter] = useState("all");
  const [professionFilter, setProfessionFilter] = useState("all");

  const filteredProfessionals = professionals.filter((prof) => {
    const matchesSearch =
      prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.councilNumber.includes(searchTerm);
    const matchesFranchise = franchiseFilter === "all" || prof.franchise === franchiseFilter;
    const matchesProfession = professionFilter === "all" || prof.profession === professionFilter;

    return matchesSearch && matchesFranchise && matchesProfession;
  });

  const handleDisable = (id: string) => {
    setProfessionals(
      professionals.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "active" ? "disabled" : "active" }
          : p
      )
    );
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/professionals/${id}/edit`);
  };

  const uniqueFranchises = Array.from(new Set(professionals.map((p) => p.franchise)));
  const uniqueProfessions = Array.from(new Set(professionals.map((p) => p.profession)));

  return (

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Profissionais</h1>
            <p className="text-muted-foreground">Gerencie os profissionais da sua clínica</p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/professionals/register")}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Profissional
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por nome ou número do conselho..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-border h-11"
            />
          </div>

          <div className="flex gap-4 flex-wrap">
            <Select value={franchiseFilter} onValueChange={setFranchiseFilter}>
              <SelectTrigger className="bg-white border-border h-10 w-48">
                <SelectValue />
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

            <Select value={professionFilter} onValueChange={setProfessionFilter}>
              <SelectTrigger className="bg-white border-border h-10 w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Profissões</SelectItem>
                {uniqueProfessions.map((profession) => (
                  <SelectItem key={profession} value={profession}>
                    {profession}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Professionals Grid */}
        {filteredProfessionals.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-border p-12 text-center">
            <div className="text-muted-foreground mb-3 opacity-50">
              <Lock className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-foreground font-medium mb-2">Ainda não há profissionais cadastrados</p>
            <p className="text-sm text-muted-foreground mb-6">
              Adicione seu primeiro profissional para começar
            </p>
            <Button
              onClick={() => router.push("/dashboard/professionals/register")}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Adicionar Profissional
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfessionals.map((professional) => (
              <div
                key={professional.id}
                className={`rounded-lg border shadow-sm hover:shadow-md transition-all ${
                  professional.status === "active"
                    ? "bg-white border-border"
                    : "bg-gray-50 border-gray-200 opacity-75"
                }`}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-lg mb-1">
                        {professional.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {professional.profession}
                      </p>
                    </div>
                    {professional.status === "disabled" && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                        Desabilitado
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-3 mb-6">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Conselho</p>
                      <p className="text-sm font-medium text-foreground">
                        {professional.council} • {professional.councilNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Franquia Atribuída</p>
                      <p className="text-sm font-medium text-foreground">
                        {professional.franchise}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-border">
                    <button
                      onClick={() => handleEdit(professional.id)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-primary hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Editar</span>
                    </button>
                    <button
                      onClick={() => handleDisable(professional.id)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        {professional.status === "active" ? "Desabilitar" : "Habilitar"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Count */}
        {filteredProfessionals.length > 0 && (
          <div className="text-sm text-muted-foreground text-center">
            Mostrando {filteredProfessionals.length} de {professionals.length} profissionais
          </div>
        )}
      </div>
  );
}
