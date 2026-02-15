"use client"

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { loginUser } from "@/services/auth/auth.service";
import { useRouter } from "next/navigation";
import { useTenant } from "@/hooks/use-tenant";
import { createTenantLink } from "@/lib/tenant-navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
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
        
        // Aguarda um pouco para garantir que o cookie foi salvo
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Redireciona mantendo o tenant na URL se houver
        const dashboardPath = createTenantLink(tenant, "/dashboard");
        window.location.href = dashboardPath;
      }

    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }

  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-14 rounded-lg flex items-center justify-center bg-blue-600">
              <Stethoscope className="w-8 h-8 text-white" />
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
                className="pl-12 h-14 text-lg bg-white border-border"
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
                className="pl-12 h-14 text-lg bg-white border-border"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm my-8">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-border" />
              <span className="text-foreground">Lembrar-me</span>
            </label>
            <Link href="/forgot-password" className="text-primary hover:text-primary/90 font-medium">
              Esqueceu a senha?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-white font-medium"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gradient-to-br from-white to-blue-50 text-muted-foreground">
              Não tem uma conta?
            </span>
          </div>
        </div>

        {/* Register Link */}
        <Link href={createTenantLink(tenant, "/auth/register")}>
          <Button
            variant="outline"
            className="w-full h-14 text-lg border-border text-foreground hover:bg-secondary"
          >
            Criar conta
          </Button>
        </Link>

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

