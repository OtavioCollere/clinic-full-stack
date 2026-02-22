"use client"

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "../../../_components/dashboard-layout";
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
import { ArrowLeft, Trash2 } from "lucide-react";
import { useTenant } from "@/hooks/use-tenant";
import { useAuthContext } from "@/context/AuthContext";
import { createTenantLink } from "@/lib/tenant-navigation";
import { getProcedureById, updateProcedure, deleteProcedure } from "@/services/procedures/procedure.service";
import { getFranchises } from "@/services/franchise/franchise.service";
import { toast } from "sonner";

export default function EditProcedure() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthContext();
  const tenant = useTenant();
  const procedureId = params?.procedureId as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [franchises, setFranchises] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
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
          // Tratar o preço que pode vir como number, string ou Decimal
          let priceValue = "";
          if (procedureResponse.price !== null && procedureResponse.price !== undefined) {
            if (typeof procedureResponse.price === 'number') {
              priceValue = procedureResponse.price.toString();
            } else if (typeof procedureResponse.price === 'string') {
              priceValue = procedureResponse.price;
            } else {
              // Pode ser um objeto Decimal do Prisma
              priceValue = String(procedureResponse.price);
            }
          }

          setFormData({
            franchiseId: procedureResponse.franchiseId || "",
            procedureName: procedureResponse.name || "",
            price: priceValue,
            notes: procedureResponse.notes || "",
          });
        } else {
          toast.error("Procedimento não encontrado");
          setTimeout(() => {
            router.push(createTenantLink(tenant, "/dashboard/procedures"));
          }, 1500);
        }
      } catch (error: any) {
        if (!isMounted) return;
        
        console.error("Erro ao carregar dados:", error);
        const errorMessage = error?.response?.data?.message || "Erro ao carregar procedimento";
        toast.error(errorMessage);
        
        // Só redireciona se for erro 404 (não encontrado)
        if (error?.response?.status === 404) {
          setTimeout(() => {
            router.push(createTenantLink(tenant, "/dashboard/procedures"));
          }, 1500);
        }
      } finally {
        if (isMounted) {
          setIsLoadingData(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [procedureId, user?.clinicId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    } catch (error: any) {
      console.error("Erro ao atualizar procedimento:", error);
      const errorMessage = error?.response?.data?.message 
        || error?.message 
        || "Erro ao atualizar procedimento. Tente novamente.";
      toast.error(errorMessage);
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
    } catch (error: any) {
      console.error("Erro ao excluir procedimento:", error);
      const errorMessage = error?.response?.data?.message 
        || error?.message 
        || "Erro ao excluir procedimento. Tente novamente.";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const isFormValid = formData.franchiseId && formData.procedureName && formData.price;

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
      {/* Header */}
      <div>
        <button
          onClick={() => router.push(createTenantLink(tenant, "/dashboard/procedures"))}
          className="flex items-center gap-2 text-primary hover:text-primary/90 font-medium mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Procedimentos
        </button>
        <h1 className="text-3xl font-bold text-foreground mb-2">Editar Procedimento</h1>
        <p className="text-muted-foreground">Atualize as informações do procedimento</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-border p-8 shadow-sm max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Franchise */}
          <div className="space-y-2">
            <Label htmlFor="franchise" className="text-foreground font-semibold">
              Franquia *
            </Label>
            <Select 
              value={formData.franchiseId} 
              onValueChange={(value) => handleSelectChange("franchiseId", value)}
              disabled
            >
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
            <p className="text-xs text-muted-foreground">
              A franquia não pode ser alterada após a criação
            </p>
          </div>

          {/* Procedure Name */}
          <div className="space-y-2">
            <Label htmlFor="procedureName" className="text-foreground font-semibold">
              Nome do Procedimento *
            </Label>
            <Input
              id="procedureName"
              name="procedureName"
              type="text"
              placeholder="e.g., Limpeza de Dentes"
              value={formData.procedureName}
              onChange={handleChange}
              className="h-11 bg-white border-border"
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-foreground font-semibold">
              Preço (R$) *
            </Label>
            <Input
              id="price"
              name="price"
              type="number"
              placeholder="e.g., 75.00"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleChange}
              className="h-11 bg-white border-border"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground font-semibold">
              Observações (Opcional)
            </Label>
            <textarea
              id="notes"
              name="notes"
              placeholder="Adicione detalhes sobre este procedimento..."
              value={formData.notes}
              onChange={handleChange}
              className="w-full border border-border rounded-lg p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Detalhes opcionais visíveis para sua equipe
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-medium disabled:opacity-50"
          >
            {isLoading ? "Atualizando Procedimento..." : "Atualizar Procedimento"}
          </Button>
        </form>
      </div>

      {/* Delete Section */}
      <div className="bg-red-50 rounded-xl border border-red-200 p-8 max-w-2xl">
        <h2 className="text-lg font-bold text-red-900 mb-2">Zona de Perigo</h2>
        <p className="text-sm text-red-700 mb-6">
          A exclusão de um procedimento não pode ser desfeita. Certifique-se de que deseja excluir este procedimento antes de continuar.
        </p>

        {!showDeleteConfirm ? (
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir Procedimento
          </Button>
        ) : (
          <div className="space-y-4 p-4 bg-white rounded-lg border border-red-300">
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
