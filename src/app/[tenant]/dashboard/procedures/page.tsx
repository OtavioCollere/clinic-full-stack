"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useTenant } from "@/hooks/use-tenant";
import { useAuthContext } from "@/context/AuthContext";
import { createTenantLink } from "@/lib/tenant-navigation";
import { getProceduresByClinicId, getProceduresByFranchiseId, deleteProcedure } from "@/services/procedures/procedure.service";
import { getFranchises } from "@/services/franchise/franchise.service";
import { toast } from "sonner";

interface Procedure {
  id: string;
  name: string;
  price: number;
  notes?: string | null;
  franchiseId: string;
  status: string;
}

interface Franchise {
  id: string;
  name: string;
}

export default function ProceduresPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const tenant = useTenant();
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.clinicId) return;

    getFranchises(user.clinicId as string)
      .then((data) => setFranchises(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [user?.clinicId]);

  useEffect(() => {
    if (!user?.clinicId) return;

    const fetchProcedures = async () => {
      try {
        setIsLoading(true);
        const response = selectedFranchiseId === "all"
          ? await getProceduresByClinicId(user.clinicId as string)
          : await getProceduresByFranchiseId(selectedFranchiseId);
        setProcedures(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Erro ao buscar procedimentos:", error);
        setProcedures([]);
        toast.error("Erro ao carregar procedimentos");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProcedures();
  }, [user?.clinicId, selectedFranchiseId]);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (deletingId === id) {
      try {
        await deleteProcedure(id);
        setProcedures((prev) => prev.filter((p) => p.id !== id));
        toast.success("Procedimento excluído com sucesso");
      } catch (error: any) {
        if (error.response?.status === 400) {
          toast.error("Não é possível excluir um procedimento com agendamentos associados");
        } else {
          toast.error("Erro ao excluir procedimento");
        }
      } finally {
        setDeletingId(null);
      }
    } else {
      setDeletingId(id);
    }
  };

  const handleEdit = (id: string) => {
    if (!id) return;
    router.push(createTenantLink(tenant, `/dashboard/procedures/${id}/edit`));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Procedimentos</h1>
          <p className="text-muted-foreground">Gerencie os procedimentos e preços da sua clínica</p>
        </div>
        <Button
          onClick={() => router.push(createTenantLink(tenant, "/dashboard/procedures/create"))}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Procedimento
        </Button>
      </div>

      {/* Franchise Filter */}
      {franchises.length > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Filtrar por unidade:</span>
          <Select value={selectedFranchiseId} onValueChange={setSelectedFranchiseId}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Todas as unidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as unidades</SelectItem>
              {franchises.map((franchise) => (
                <SelectItem key={franchise.id} value={franchise.id}>
                  {franchise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando procedimentos...</p>
        </div>
      )}

      {/* Procedures Grid */}
      {!isLoading && procedures.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {procedures.map((procedure) => (
            <div
              key={procedure.id}
              className="bg-card rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4">
                <h3 className="font-semibold text-foreground text-lg mb-2">
                  {procedure.name}
                </h3>
                {procedure.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {procedure.notes}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <p className="text-2xl font-bold text-primary">
                  R$ {typeof procedure.price === 'number' ? procedure.price.toFixed(2) : parseFloat(procedure.price as string).toFixed(2)}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEdit(procedure.id);
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-primary border border-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Editar</span>
                </button>
                {deletingId === procedure.id ? (
                  <div className="flex flex-1 gap-1">
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(procedure.id); }}
                      className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    >
                      Confirmar
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeletingId(null); }}
                      className="flex-1 px-3 py-2 text-sm font-medium text-foreground border border-border hover:bg-secondary rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(procedure.id); }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Excluir</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && procedures.length === 0 && (
        <div className="bg-card rounded-xl border border-dashed border-border p-12 text-center">
          <div className="text-muted-foreground mb-3 opacity-50">
            <Trash2 className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-foreground font-medium mb-2">
            {selectedFranchiseId === "all"
              ? "Ainda não há procedimentos"
              : "Nenhum procedimento nesta unidade"}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {selectedFranchiseId === "all"
              ? "Crie seu primeiro procedimento para começar"
              : "Adicione um procedimento ou selecione outra unidade"}
          </p>
          <Button
            onClick={() => router.push(createTenantLink(tenant, "/dashboard/procedures/create"))}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Adicionar Procedimento
          </Button>
        </div>
      )}
    </div>
  );
}
