"use client"

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Stethoscope, CreditCard } from "lucide-react";
import { validateCPF } from "@/utils/validate-cpf";
import { registerUser } from "@/services/auth/auth.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // CPF validation state - tracks if field was touched and validation status
  const [cpfTouched, setCpfTouched] = useState(false);
  const [cpfIsValid, setCpfIsValid] = useState<boolean | null>(null);

  // CPF masking function - formats input as 000.000.000-00
  const maskCPF = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Apply CPF masking if it's the CPF field
    if (name === "cpf") {
      const maskedValue = maskCPF(value);
      setFormData((prev) => ({
        ...prev,
        [name]: maskedValue,
      }));
      
      // Reset validation state while typing (neutral state)
      // Only validate if field was previously touched
      if (cpfTouched) {
        const isValid = validateCPF(maskedValue);
        setCpfIsValid(isValid);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle CPF blur - validate when user leaves the field
  const handleCpfBlur = () => {
    setCpfTouched(true);
    if (formData.cpf) {
      const isValid = validateCPF(formData.cpf);
      setCpfIsValid(isValid);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate CPF before submission
    const cpfValid = validateCPF(formData.cpf);
    if (!cpfValid) {
      setCpfTouched(true);
      setCpfIsValid(false);
      return;
    }
    
    setIsLoading(true);
    
    try{
      const response = await registerUser(formData);
      if(response.success){
        toast.success(response.message);
      }

      router.push("/dashboard");

      setIsLoading(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 
        "Erro ao criar conta. Tente novamente."
      );
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
          <h1 className="text-3xl font-bold text-foreground mb-4">Criar conta</h1>
          <p className="text-muted-foreground">Registre o painel da sua clínica</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-lg text-foreground font-medium">
              Nome completo
            </Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                className="pl-12 h-14 text-lg bg-white border-border"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="email" className="text-lg text-foreground font-medium">
              Endereço de e-mail
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@clinic.com"
                value={formData.email}
                onChange={handleChange}
                className="pl-12 h-14 text-lg bg-white border-border"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="cpf" className="text-lg text-foreground font-medium">
              CPF
            </Label>
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
                className={`pl-12 h-14 text-lg bg-white border-border ${
                  cpfTouched
                    ? cpfIsValid === false
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : cpfIsValid === true
                      ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                      : ""
                    : ""
                }`}
                required
              />
            </div>
            {/* Error message - only show when invalid and touched */}
            {cpfTouched && cpfIsValid === false && (
              <p className="text-sm text-red-500">Coloque um CPF válido</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="password" className="text-lg text-foreground font-medium">
              Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="pl-12 h-14 text-lg bg-white border-border"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Pelo menos 8 caracteres com maiúsculas, números e caracteres especiais
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="confirmPassword" className="text-lg text-foreground font-medium">
              Confirmar senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="pl-12 h-14 text-lg bg-white border-border"
                required
              />
            </div>
          </div>

          <div className="flex items-start gap-2 my-8">
            <input type="checkbox" id="terms" className="rounded border-border mt-1" required />
            <label htmlFor="terms" className="text-sm text-muted-foreground">
              Eu concordo com os{" "}
              <a href="#" className="text-primary hover:underline">
                Termos de Serviço
              </a>{" "}
              e{" "}
              <a href="#" className="text-primary hover:underline">
                Política de Privacidade
              </a>
            </label>
          </div>

          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-white font-medium"
          >
            {isLoading ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gradient-to-br from-white to-blue-50 text-muted-foreground">
              Já tem uma conta?
            </span>
          </div>
        </div>

        {/* Login Link */}
        <Link href="/auth/login">
          <Button
            variant="outline"
            className="w-full h-14 text-lg border-border text-foreground hover:bg-secondary"
          >
            Entrar em vez disso
          </Button>
        </Link>
      </div>
    </div>
  );
}
