"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Mail, CreditCard } from "lucide-react";
import { validateCPF } from "@/utils/validate-cpf";
import { useAuthContext } from "@/context/AuthContext";
import { useTenant } from "@/hooks/use-tenant";
import { createTenantLink } from "@/lib/tenant-navigation";
import { createStaffMember } from "@/services/professional/professional.service";
import { toast } from "sonner";
import { ProfessionalsPolicy } from "@/lib/professionals-policy";

type StaffType = "profissional" | "recepcionista";

export default function RegisterProfessional() {
  const router = useRouter();
  const { user, loading: userLoading } = useAuthContext();
  const tenant = useTenant();
  const canCreate = ProfessionalsPolicy.canCreate(user);
  const [isLoading, setIsLoading] = useState(false);
  const [staffType, setStaffType] = useState<StaffType>("profissional");

  const [cpfTouched, setCpfTouched] = useState(false);
  const [cpfIsValid, setCpfIsValid] = useState<boolean | null>(null);

  const [formData, setFormData] = useState({ name: "", cpf: "", email: "" });

  useEffect(() => {
    if (userLoading) return;
    if (user && !canCreate) {
      router.replace(createTenantLink(tenant, "/403"));
    }
  }, [userLoading, user, canCreate, tenant, router]);

  const maskCPF = (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "cpf") {
      const masked = maskCPF(value);
      setFormData((prev) => ({ ...prev, cpf: masked }));
      if (cpfTouched) setCpfIsValid(validateCPF(masked));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCpfBlur = () => {
    setCpfTouched(true);
    if (formData.cpf) setCpfIsValid(validateCPF(formData.cpf));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCPF(formData.cpf)) {
      setCpfTouched(true);
      setCpfIsValid(false);
      return;
    }
    if (!user?.clinicId) return;

    setIsLoading(true);
    try {
      await createStaffMember(user.clinicId as string, {
        name: formData.name,
        cpf: formData.cpf,
        email: formData.email,
      });
      toast.success(`${staffType === "profissional" ? "Profissional" : "Recepcionista"} cadastrado(a) com sucesso! Um email com as credenciais foi enviado.`);
      router.push(createTenantLink(tenant, "/dashboard/professionals"));
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message ?? "Erro ao cadastrar. Tente novamente.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.name.trim() && formData.email.trim() && cpfIsValid === true;

  if (userLoading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><div className="text-muted-foreground">Carregando...</div></div>;
  }
  if (user && !canCreate) {
    return <div className="flex min-h-[40vh] items-center justify-center"><div className="text-muted-foreground">Redirecionando...</div></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <button
          onClick={() => router.push(createTenantLink(tenant, "/dashboard/professionals"))}
          className="flex items-center gap-2 text-primary hover:text-primary/90 font-medium mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Profissionais
        </button>
        <h1 className="text-3xl font-bold text-foreground mb-2">Cadastrar Membro da Equipe</h1>
        <p className="text-muted-foreground">Adicione um novo membro com acesso ao painel administrativo</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-8 shadow-sm max-w-2xl">
        {/* Toggle tipo */}
        <div className="flex gap-2 mb-6 p-1 bg-secondary rounded-lg">
          {(["profissional", "recepcionista"] as StaffType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setStaffType(type)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                staffType === type ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {type === "profissional" ? "Profissional" : "Recepcionista"}
            </button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground mb-6 bg-muted/50 rounded-lg px-4 py-3">
          Este usuário terá acesso de <strong>administrador</strong> ao sistema e poderá gerenciar consultas, pacientes, procedimentos e relatórios.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground font-semibold">Nome Completo *</Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Nome completo"
                value={formData.name}
                onChange={handleChange}
                className="pl-12 h-11 bg-card border-border"
                required
              />
            </div>
          </div>

          {/* CPF */}
          <div className="space-y-2">
            <Label htmlFor="cpf" className="text-foreground font-semibold">CPF *</Label>
            <div className="relative">
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="cpf"
                name="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={handleChange}
                onBlur={handleCpfBlur}
                className={`pl-12 h-11 bg-card border-border ${
                  cpfTouched
                    ? cpfIsValid === false
                      ? "border-red-500"
                      : cpfIsValid === true
                      ? "border-green-500"
                      : ""
                    : ""
                }`}
                required
              />
            </div>
            {cpfTouched && cpfIsValid === false && (
              <p className="text-sm text-red-500">CPF inválido</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-semibold">E-mail *</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@clinica.com"
                value={formData.email}
                onChange={handleChange}
                className="pl-12 h-11 bg-card border-border"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(createTenantLink(tenant, "/dashboard/professionals"))}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
            >
              {isLoading ? "Cadastrando..." : "Cadastrar e Enviar Acesso"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
