"use client";

import { ArrowLeft, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { getFranchises } from "@/services/franchise/franchise.service";
import {
  deleteProcedure,
  getProcedureById,
  updateProcedure,
} from "@/services/procedures/procedure.service";

type Franchise = { id: string; name: string };

type ApiError = {
  response?: { data?: { message?: string }; status?: number };
  message?: string;
};

const getApiError = (error: unknown) => error as ApiError;
const getErrorMessage = (error: unknown, fallback: string) => {
  const apiError = getApiError(error);
  return apiError?.response?.data?.message || apiError?.message || fallback;
};

export default function EditProcedure() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthContext();
  const tenant = useTenant();
  const procedureId = params?.procedureId as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [formData, setFormData] = useState({
    franchiseId: "",
    procedureName: "",
    price: "",
    notes: "",
  });

  useEffect(() => {
    if (!procedureId || !user?.clinicId) {
      setIsLoadingData(false);
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        const [procedureResponse, franchisesResponse] = await Promise.all([
          getProcedureById(procedureId),
          getFranchises(user.clinicId as string),
        ]);

        if (!isMounted) return;

        setFranchises(franchisesResponse);

        if (procedureResponse) {
          let priceValue = "";
          if (procedureResponse.price !== null && procedureResponse.price !== undefined) {
            priceValue = String(procedureResponse.price);
          }
          setFormData({
            franchiseId: procedureResponse.franchiseId || "",
            procedureName: procedureResponse.name || "",
            price: priceValue,
            notes: procedureResponse.notes || "",
          });
        } else {
          toast.error("Procedimento não encontrado");
          setTimeout(() => router.push(createTenantLink(tenant, "/dashboard/procedures")), 1500);
        }
      } catch (error: unknown) {
        if (!isMounted) return;
        const apiError = getApiError(error);
        toast.error(getErrorMessage(error, "Erro ao carregar procedimento"));
        if (apiError?.response?.status === 404) {
          setTimeout(() => router.push(createTenantLink(tenant, "/dashboard/procedures")), 1500);
        }
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [procedureId, router, tenant, user?.clinicId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateProcedure(procedureId, {
        name: formData.procedureName,
        price: parseFloat(formData.price),
        notes: formData.notes || undefined,
      });
      toast.success("Procedimento atualizado com sucesso!");
      router.push(createTenantLink(tenant, "/dashboard/procedures"));
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Erro ao atualizar procedimento. Tente novamente."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!procedureId) return;
    setIsDeleting(true);
    try {
      await deleteProcedure(procedureId);
      toast.success("Procedimento excluído com sucesso!");
      router.push(createTenantLink(tenant, "/dashboard/procedures"));
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Erro ao excluir procedimento. Tente novamente."));
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const isFormValid =
    formData.franchiseId &&
    formData.procedureName &&
    formData.price &&
    parseFloat(formData.price) > 0;

  if (isLoadingData) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando procedimento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <button
          type="button"
          onClick={() => router.push(createTenantLink(tenant, "/dashboard/procedures"))}
          className="flex items-center gap-2 text-primary hover:text-primary/90 font-medium mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Procedimentos
        </button>
        <h1 className="text-3xl font-bold text-foreground mb-2">Editar Procedimento</h1>
        <p className="text-muted-foreground">Atualize as informações do procedimento</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-8 shadow-sm max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="franchise" className="text-foreground font-semibold">
              Franquia *
            </Label>
            <Select value={formData.franchiseId} disabled>
              <SelectTrigger id="franchise" className="bg-gray-50 border-border h-11 cursor-not-allowed">
                <SelectValue placeholder="Selecione uma franquia" />
              </SelectTrigger>
              <SelectContent>
                {franchises.map((franchise) => (
                  <SelectItem key={franchise.id} value={franchise.id}>
                    {franchise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">A franquia não pode ser alterada após a criação</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="procedureName" className="text-foreground font-semibold">
              Nome do Procedimento *
            </Label>
            <Input
              id="procedureName"
              name="procedureName"
              type="text"
              value={formData.procedureName}
              onChange={handleChange}
              className="h-11 bg-card border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price" className="text-foreground font-semibold">
              Preço (R$) *
            </Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleChange}
              className="h-11 bg-card border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground font-semibold">
              Observações (Opcional)
            </Label>
            <textarea
              id="notes"
              name="notes"
              placeholder="Detalhes sobre o procedimento..."
              value={formData.notes}
              onChange={handleChange}
              className="w-full border border-border rounded-lg p-3 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={4}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-medium disabled:opacity-50"
          >
            {isLoading ? "Atualizando Procedimento..." : "Atualizar Procedimento"}
          </Button>
        </form>
      </div>

      <div className="bg-red-50 rounded-xl border border-red-200 p-8 max-w-2xl">
        <h2 className="text-lg font-bold text-red-900 mb-2">Zona de Perigo</h2>
        <p className="text-sm text-red-700 mb-6">
          A exclusão de um procedimento não pode ser desfeita.
        </p>
        {!showDeleteConfirm ? (
          <Button onClick={() => setShowDeleteConfirm(true)} className="bg-red-600 hover:bg-red-700 text-white">
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir Procedimento
          </Button>
        ) : (
          <div className="space-y-4 p-4 bg-card rounded-lg border border-red-300">
            <p className="text-sm font-medium text-red-900">
              Tem certeza de que deseja excluir "{formData.procedureName}"?
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
                className="flex-1 border-border"
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {isDeleting ? "Excluindo..." : "Excluir Procedimento"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
