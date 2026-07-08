"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { ArrowLeft, User, Stethoscope } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useTenant } from "@/hooks/use-tenant";
import { createTenantLink } from "@/lib/tenant-navigation";
import {
  getProfessionalById,
  updateProfessional,
} from "@/services/professional/professional.service";
import { toast } from "sonner";
import { ProfessionalsPolicy } from "@/lib/professionals-policy";

export default function EditProfessionalPage() {
  const router = useRouter();
  const params = useParams();
  const professionalId = params.id as string;
  const { user, loading: userLoading } = useAuthContext();
  const tenant = useTenant();
  const canEdit = ProfessionalsPolicy.canCreate(user);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState({
    profession: "",
    council: "",
    councilNumber: "",
    councilState: "",
  });
  const [readonlyData, setReadonlyData] = useState({
    name: "",
    franchiseId: "",
  });

  useEffect(() => {
    if (userLoading) return;
    if (user && !canEdit) {
      router.replace(createTenantLink(tenant, "/403"));
    }
  }, [userLoading, user, canEdit, tenant, router]);

  useEffect(() => {
    if (!professionalId) return;
    const load = async () => {
      setIsFetching(true);
      try {
        const data = await getProfessionalById(professionalId);
        setReadonlyData({ name: data.name ?? "", franchiseId: data.franchiseId });
        setFormData({
          profession: data.profession ?? "",
          council: data.council ?? "",
          councilNumber: data.councilNumber ?? "",
          councilState: data.councilState ?? "",
        });
      } catch {
        toast.error("Erro ao carregar dados do profissional");
        router.push(createTenantLink(tenant, "/dashboard/professionals"));
      } finally {
        setIsFetching(false);
      }
    };
    load();
  }, [professionalId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfessionChange = (value: string) => {
    const council = value === "BIOMEDICO" ? "CRBM" : value === "MEDICO" ? "CRM" : "";
    setFormData((prev) => ({ ...prev, profession: value, council }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    try {
      await updateProfessional(professionalId, {
        editorId: user.id,
        profession: formData.profession || undefined,
        council: formData.council || undefined,
        councilNumber: formData.councilNumber || undefined,
        councilState: formData.councilState || undefined,
      });
      toast.success("Profissional atualizado com sucesso!");
      router.push(createTenantLink(tenant, "/dashboard/professionals"));
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ?? "Erro ao atualizar profissional.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const councilLabel =
    formData.council === "CRBM"
      ? "CRBM (Conselho Regional de Biomedicina)"
      : formData.council === "CRM"
      ? "CRM (Conselho Regional de Medicina)"
      : "";

  if (userLoading || isFetching) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <button
          onClick={() =>
            router.push(createTenantLink(tenant, "/dashboard/professionals"))
          }
          className="flex items-center gap-2 text-primary hover:text-primary/90 font-medium mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Profissionais
        </button>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Editar Profissional
        </h1>
        <p className="text-muted-foreground">
          Atualize as informações profissionais
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border p-8 shadow-sm max-w-2xl space-y-6">
        {/* Readonly info */}
        <div className="space-y-2">
          <Label className="text-foreground font-semibold">Nome</Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={readonlyData.name}
              readOnly
              className="pl-12 h-11 bg-accent border-border cursor-not-allowed opacity-60"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            O nome não pode ser alterado por aqui.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profession */}
          <div className="space-y-2">
            <Label htmlFor="profession" className="text-foreground font-semibold">
              Profissão
            </Label>
            <Select
              value={formData.profession}
              onValueChange={handleProfessionChange}
            >
              <SelectTrigger id="profession" className="bg-card border-border h-11">
                <SelectValue placeholder="Selecione a profissão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BIOMEDICO">Biomédico(a)</SelectItem>
                <SelectItem value="MEDICO">Médico(a)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Council (readonly, auto-derived) */}
          <div className="space-y-2">
            <Label className="text-foreground font-semibold">Conselho</Label>
            <div className="relative">
              <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={councilLabel}
                readOnly
                className="pl-12 h-11 bg-accent border-border cursor-not-allowed opacity-60"
                placeholder={
                  formData.profession ? "" : "Selecione a profissão primeiro"
                }
              />
            </div>
          </div>

          {/* Council Number */}
          <div className="space-y-2">
            <Label htmlFor="councilNumber" className="text-foreground font-semibold">
              Número de Registro no Conselho
            </Label>
            <Input
              id="councilNumber"
              name="councilNumber"
              type="text"
              placeholder="ex: 123456"
              value={formData.councilNumber}
              onChange={handleChange}
              className="h-11 bg-card border-border"
            />
          </div>

          {/* Council State */}
          <div className="space-y-2">
            <Label htmlFor="councilState" className="text-foreground font-semibold">
              Estado do Conselho
            </Label>
            <Input
              id="councilState"
              name="councilState"
              type="text"
              placeholder="ex: SP"
              value={formData.councilState}
              onChange={handleChange}
              className="h-11 bg-card border-border"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(
                  createTenantLink(tenant, "/dashboard/professionals")
                )
              }
              className="flex-1 h-11"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-11 bg-primary hover:bg-primary/90 text-white font-medium"
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
