"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { changePassword } from "@/services/auth/change-password.service";
import { useTenant } from "@/hooks/use-tenant";
import { createTenantLink } from "@/lib/tenant-navigation";

export default function ChangePasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenant = useTenant();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Token inválido ou ausente. Por favor, use o link enviado por email.");
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const validatePassword = () => {
    if (!formData.newPassword || !formData.confirmPassword) {
      setError("Por favor, preencha ambas as senhas");
      return false;
    }

    if (formData.newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Token inválido ou ausente. Por favor, use o link enviado por email.");
      return;
    }

    if (!validatePassword()) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await changePassword(token, {
        password: formData.newPassword,
      });

      toast.success(response.message || "Senha alterada com sucesso!");

      // Aguarda um pouco para garantir que o usuário veja a mensagem
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const loginPath = createTenantLink(tenant, "/auth/login");
      router.push(loginPath);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao alterar senha. Tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">SaaS Clinic</span>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800 font-medium">
              ⚠️ Alteração de Senha Obrigatória
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Para sua segurança, é necessário alterar sua senha no primeiro acesso.
            </p>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">Altere sua Senha</h1>
          <p className="text-muted-foreground">Crie uma senha segura para sua conta</p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-foreground font-semibold">
                Nova Senha *
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="pr-10 h-11 bg-card border-border"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Mínimo 6 caracteres
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground font-semibold">
                Confirmar Senha *
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pr-10 h-11 bg-card border-border"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-medium disabled:opacity-50"
            >
              {isLoading ? "Alterando senha..." : "Alterar Senha"}
            </Button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-900">
              <strong>Dica:</strong> Use uma mistura de letras maiúsculas, minúsculas, números
              e símbolos para maior segurança.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
