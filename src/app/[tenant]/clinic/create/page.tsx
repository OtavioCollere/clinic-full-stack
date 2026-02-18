"use client"

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, Upload, X, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { validateCNPJ } from "@/utils/validate-cnpj";
import { createClinic } from "@/services/clinic/clinic.service";
import { routes } from "@/lib/routes";
import { useAuthContext } from "@/context/AuthContext";
import { useTenant } from "@/hooks/use-tenant";
import { createTenantLink } from "@/lib/tenant-navigation";

export default function CreateClinic() {
  const router = useRouter();
  const tenant = useTenant();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    clinicName: "",
    cnpj: "",
    description: "",
  });

  const { user } = useAuthContext();

  // CNPJ validation state - tracks if field was touched and validation status
  const [cnpjTouched, setCnpjTouched] = useState(false);
  const [cnpjIsValid, setCnpjIsValid] = useState<boolean | null>(null);

  // CNPJ masking function - formats input as 00.000.000/0000-00
  const maskCNPJ = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
    if (cleaned.length <= 12) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`;
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Apply CNPJ masking if it's the CNPJ field
    if (name === "cnpj") {
      const maskedValue = maskCNPJ(value);
      setFormData((prev) => ({
        ...prev,
        [name]: maskedValue,
      }));
      
      // Reset validation state while typing (neutral state)
      // Only validate if field was previously touched
      if (cnpjTouched) {
        const isValid = validateCNPJ(maskedValue);
        setCnpjIsValid(isValid);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle CNPJ blur - validate when user leaves the field
  const handleCnpjBlur = () => {
    setCnpjTouched(true);
    if (formData.cnpj) {
      const isValid = validateCNPJ(formData.cnpj);
      setCnpjIsValid(isValid);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clinicName.trim()) {
      return;
    }

    // Validate CNPJ before submission
    const cnpjValid = validateCNPJ(formData.cnpj);
    if (!cnpjValid) {
      setCnpjTouched(true);
      setCnpjIsValid(false);
      return;
    }

    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    setIsLoading(true);

    try{
      // post request to create clinic
      const response = await createClinic({
        name: formData.clinicName,
        ownerId: user.id,
        cnpj: formData.cnpj,
        description: formData.description,
        avatarUrl: avatar || undefined,
      });

      if(response.success){
        toast.success(response.message);
        router.push(createTenantLink(tenant, "/franchise/create"));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao criar clínica");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">Cliniker</span>
          </div>

          {/* Progress Indicator */}
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                1
              </div>
              <span className="text-sm font-medium text-foreground">
                Criar sua clínica
              </span>
            </div>
            <div className="w-12 h-0.5 bg-border mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Criar primeira franquia
              </span>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-2">
            Criar sua clínica
          </h1>
          <p className="text-muted-foreground">
            Configure o perfil da sua clínica e comece a gerenciar sua prática
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Clinic Logo/Avatar Upload */}
            <div>
              <Label className="text-foreground font-semibold mb-4 block">
                Logo da Clínica (Opcional)
              </Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />

              {avatar ? (
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={avatar}
                      alt="Clinic logo"
                      className="w-24 h-24 rounded-xl object-cover border border-border"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                  >
                    Alterar Logo
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-secondary/50 transition-colors"
                >
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground mb-1">
                    Clique para enviar o logo da clínica
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF até 5MB
                  </p>
                </button>
              )}
            </div>

            {/* Clinic Name */}
            <div className="space-y-2">
              <Label htmlFor="clinicName" className="text-foreground font-semibold">
                Nome da Clínica *
              </Label>
              <Input
                id="clinicName"
                name="clinicName"
                type="text"
                placeholder="e.g., Wellness Dental Clinic"
                value={formData.clinicName}
                onChange={handleChange}
                className="h-11 bg-white border-border"
                required
              />
            </div>

            {/* CNPJ */}
            <div className="space-y-2">
              <Label htmlFor="cnpj" className="text-foreground font-semibold">
                CNPJ *
              </Label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="cnpj"
                  name="cnpj"
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj}
                  onChange={handleChange}
                  onBlur={handleCnpjBlur}
                  className={`pl-12 h-11 bg-white border-border ${
                    cnpjTouched
                      ? cnpjIsValid === false
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : cnpjIsValid === true
                        ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                        : ""
                      : ""
                  }`}
                  required
                />
              </div>
              {/* Error message - only show when invalid and touched */}
              {cnpjTouched && cnpjIsValid === false && (
                <p className="text-sm text-red-500">Coloque um CNPJ válido</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground font-semibold">
                Descrição (Opcional)
              </Label>
              <textarea
                id="description"
                name="description"
                placeholder="Conte-nos sobre sua clínica..."
                value={formData.description}
                onChange={handleChange}
                className="w-full border border-border rounded-lg p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Conte aos pacientes o que torna sua clínica especial
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !formData.clinicName.trim()}
              onClick={handleSubmit}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Criando clínica...
                </span>
              ) : (
                "Criar Clínica"
              )}
            </Button>

            {/* Additional Info */}
            <p className="text-xs text-muted-foreground text-center">
              Você pode atualizar essas informações a qualquer momento em Configurações
            </p>
          </form>
        </div>

      </div>
    </div>
  );
}
