"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, User, Mail, CreditCard } from "lucide-react";
import { validateCPF } from "@/utils/validate-cpf";
import { useAuthContext } from "@/context/AuthContext";

export default function RegisterProfessional() {
  const router = useRouter();
  const { user, loading: userLoading } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<"professional" | "colaborator">("professional");
  
  // CPF validation state
  const [cpfTouched, setCpfTouched] = useState(false);
  const [cpfIsValid, setCpfIsValid] = useState<boolean | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    email: '',
    franchiseId: '',
    ownerId: '', // Dono que está cadastrando o profissional
    council: '',
    councilNumber: '',
    councilState: '',
    profession: '',
    linkedUser: '',
  });
  
  console.log(user)

  // CPF masking function - formats input as 000.000.000-00
  const maskCPF = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

  const handleSelectChange = (name: string, value: string) => {
    if (name === "profession") {
      // Define o conselho automaticamente baseado na profissão
      let council = "";
      if (value === "BIOMEDICO") {
        council = "CRBM";
      } else if (value === "MEDICO") {
        council = "CRM";
      }
      
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        council: council,
      }));
      
      // Debug: verificar se o valor foi setado
      console.log("Profissão selecionada:", value, "Conselho definido:", council);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate CPF before submission
    const cpfValid = validateCPF(formData.cpf);
    if (!cpfValid) {
      setCpfTouched(true);
      setCpfIsValid(false);
      return;
    }
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard/professionals");
    }, 1500);
  };

  const isFormValid = userType === "professional" 
    ? formData.name && formData.cpf && formData.email && formData.profession && formData.franchiseId && cpfIsValid === true
    : formData.name && formData.cpf && formData.email && formData.profession && formData.franchiseId && cpfIsValid === true;

  return (
    <div className="space-y-8">
        {/* Header */}
        <div>
          <button
            onClick={() => router.push("/dashboard/professionals")}
            className="flex items-center gap-2 text-primary hover:text-primary/90 font-medium mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Profissionais
          </button>
          <h1 className="text-3xl font-bold text-foreground mb-2">Cadastrar Profissional</h1>
          <p className="text-muted-foreground">Adicione um novo profissional à sua clínica</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-border p-8 shadow-sm max-w-2xl">
          {/* Toggle Buttons */}
          <div className="flex gap-2 mb-6 p-1 bg-secondary rounded-lg">
            <button
              type="button"
              onClick={() => setUserType("professional")}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                userType === "professional"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Profissional
            </button>
            <button
              type="button"
              onClick={() => setUserType("colaborator")}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                userType === "colaborator"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Colaborador
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-semibold">
                Nome Completo *
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
                  className="pl-12 h-11 bg-white border-border"
                  required
                />
              </div>
            </div>

            {/* CPF */}
            <div className="space-y-2">
              <Label htmlFor="cpf" className="text-foreground font-semibold">
                CPF *
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
                  className={`pl-12 h-11 bg-white border-border ${
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

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-semibold">
                Endereço de E-mail *
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
                  className="pl-12 h-11 bg-white border-border"
                  required
                />
              </div>
            </div>

            {/* Profession */}
            <div className="space-y-2">
              <Label htmlFor="profession" className="text-foreground font-semibold">
                Profissão *
              </Label>
              <Select value={formData.profession} onValueChange={(value) =>
                handleSelectChange("profession", value)
              }>
                <SelectTrigger id="profession" className="bg-white border-border h-11">
                  <SelectValue placeholder="Selecione a profissão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BIOMEDICO">Biomédico(a)</SelectItem>
                  <SelectItem value="MEDICO">Médico(a)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Council - Only for Professional */}
            {userType === "professional" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="council" className="text-foreground font-semibold">
                    Conselho
                  </Label>
                  <Input
                    id="council"
                    name="council"
                    type="text"
                    value={formData.council ? (formData.council === "CRBM" ? "CRBM (Conselho Regional de Biomedicina)" : "CRM (Conselho Regional de Medicina)") : ""}
                    readOnly
                    className="h-11 bg-gray-50 border-border cursor-not-allowed"
                    placeholder={formData.profession ? "" : "Selecione a profissão primeiro"}
                  />
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
                    className="h-11 bg-white border-border"
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
                    placeholder="e.g., SP"
                    value={formData.councilState}
                    onChange={handleChange}
                    className="h-11 bg-white border-border"
                  />
                </div>
              </>
            )}

            {/* Associated Franchise */}
            <div className="space-y-2">
              <Label htmlFor="franchise" className="text-foreground font-semibold">
                Franquia Associada *
              </Label>
              <Select value={formData.franchiseId} onValueChange={(value) =>
                handleSelectChange("franchiseId", value)
              }>
                <SelectTrigger id="franchise" className="bg-white border-border h-11">
                  <SelectValue placeholder="Selecione a franquia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="downtown">Downtown Unit</SelectItem>
                  <SelectItem value="uptown">Uptown Unit</SelectItem>
                  <SelectItem value="mall">Shopping Mall Unit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Linked User */}
            <div className="space-y-2">
              <Label htmlFor="linkedUser" className="text-foreground font-semibold">
                Usuário Vinculado (Selecione um usuário existente)
              </Label>
              <Select value={formData.linkedUser} onValueChange={(value) =>
                handleSelectChange("linkedUser", value)
              }>
                <SelectTrigger id="linkedUser" className="bg-white border-border h-11">
                  <SelectValue placeholder="Selecione o usuário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user1">Dr. John Smith (john@clinic.com)</SelectItem>
                  <SelectItem value="user2">Dr. Maria Garcia (maria@clinic.com)</SelectItem>
                  <SelectItem value="user3">Sarah Johnson (sarah@clinic.com)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-medium disabled:opacity-50"
            >
              {isLoading 
                ? `Criando ${userType === "professional" ? "Profissional" : "Colaborador"}...` 
                : `Criar ${userType === "professional" ? "Profissional" : "Colaborador"}`}
            </Button>
          </form>
        </div>
    </div>
  );
}
