"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { loginUser } from "@/services/auth/auth.service";
import { useTenant } from "@/hooks/use-tenant";
import { createTenantLink } from "@/lib/tenant-navigation";
import { getPortalBaseForRole, type ClinicRoleType } from "@/lib/portal";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const tenant = useTenant();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if(!email || !password){
      toast.error("Por favor, preencha todos os campos");
      setIsLoading(false);
      return;
    }

    try{
      const response = await loginUser({email, password});
      
      if(response.status === 200){
        toast.success(response.data.message);
        const role = (response.data?.clinicRole?.value ?? response.data?.clinicRole) as ClinicRoleType | undefined;
        const portalBase = role ? getPortalBaseForRole(role) : "/dashboard";
        const redirectPath = createTenantLink(tenant, portalBase);
        window.location.href = redirectPath;
      }

    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }

  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#fdf8f0] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-14 rounded-lg flex items-center justify-center bg-primary">
              <Stethoscope className="w-8 h-8 text-primary-foreground" />
            </div>
            <span className="text-4xl font-bold text-foreground">Cliniker</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Bem-vindo de volta</h1>
          <p className="text-muted-foreground">Entre no painel da sua clínica</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-lg text-foreground font-medium">
              Endereço de e-mail
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@clinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-14 text-lg bg-card border-border"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="password" className="text-lg text-foreground font-medium">
              Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 h-14 text-lg bg-card border-border"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm my-8">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-border" />
              <span className="text-foreground">Lembrar-me</span>
            </label>
            <a href="/forgot-password" className="text-primary hover:text-primary/90 font-medium">
              Esqueceu a senha?
            </a>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-white font-medium"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Ao entrar, você concorda com nossos{" "}
          <a href="#" className="text-primary hover:underline">
            Termos de Serviço
          </a>{" "}
          e{" "}
          <a href="#" className="text-primary hover:underline">
            Política de Privacidade
          </a>
        </p>
      </div>
    </div>
  );
}

