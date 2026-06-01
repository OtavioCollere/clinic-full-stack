"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { createProcedure } from "@/services/procedures/procedure.service";

type Franchise = {
  id: string;
  name: string;
};

type ApiError = {
  response?: { data?: { message?: string } };
  message?: string;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const apiError = error as ApiError;
  return apiError?.response?.data?.message || apiError?.message || fallback;
};

export default function CreateProcedure() {
  const router = useRouter();
  const { user } = useAuthContext();
  const tenant = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [createForAll, setCreateForAll] = useState(false);
  const [formData, setFormData] = useState({
    franchise: "",
    procedureName: "",
    price: "",
    notes: "",
  });

  useEffect(() => {
    if (!user?.clinicId) return;
    getFranchises(user.clinicId as string)
      .then(setFranchises)
      .catch(() => setFranchises([]));
  }, [user?.clinicId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createProcedure({
        franchiseId: createForAll ? "" : formData.franchise,
        name: formData.procedureName,
        price: parseFloat(formData.price),
        notes: formData.notes,
        createForAllFranchises: createForAll,
        clinicId: user?.clinicId as string,
      });
      toast.success(
        createForAll
          ? `Procedimento criado para todas as ${franchises.length} franquias!`
          : "Procedimento criado com sucesso!",
      );
      router.push(createTenantLink(tenant, "/dashboard/procedures"));
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Erro ao criar procedimento. Tente novamente."));
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    (createForAll || formData.franchise) &&
    formData.procedureName &&
    formData.price &&
    parseFloat(formData.price) > 0;

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
        <h1 className="text-3xl font-bold text-foreground mb-2">Criar Procedimento</h1>
        <p className="text-muted-foreground">Adicione um novo procedimento à sua clínica</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-8 shadow-sm max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-2 p-4 bg-secondary rounded-lg">
            <Checkbox
              id="createForAll"
              checked={createForAll}
              onCheckedChange={(checked) => {
                setCreateForAll(checked as boolean);
                if (checked) setFormData((prev) => ({ ...prev, franchise: "" }));
              }}
            />
            <Label htmlFor="createForAll" className="text-sm font-medium cursor-pointer">
              Criar para todas as franquias
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="franchise" className="text-foreground font-semibold">
              Franquia {!createForAll && "*"}
            </Label>
            <Select
              value={formData.franchise}
              onValueChange={(value) => handleSelectChange("franchise", value)}
              disabled={createForAll}
            >
              <SelectTrigger
                id="franchise"
                className={`bg-card border-border h-11 ${createForAll ? "opacity-50 cursor-not-allowed" : ""}`}
              >
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
            {createForAll && (
              <p className="text-xs text-muted-foreground">
                O procedimento será criado para todas as {franchises.length} franquias
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="procedureName" className="text-foreground font-semibold">
              Nome do Procedimento *
            </Label>
            <Input
              id="procedureName"
              name="procedureName"
              type="text"
              placeholder="Ex: Botox, Preenchimento labial..."
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
              placeholder="Ex: 350.00"
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
            {isLoading ? "Criando Procedimento..." : "Criar Procedimento"}
          </Button>
        </form>
      </div>
    </div>
  );
}
