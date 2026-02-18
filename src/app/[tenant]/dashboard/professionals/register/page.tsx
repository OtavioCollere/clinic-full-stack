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
import { useTenant } from "@/hooks/use-tenant";
import { createTenantLink } from "@/lib/tenant-navigation";
import { getFranchises } from "@/services/franchise/franchise.service";
import { createProfessional } from "@/services/professional/professional.service";
import { toast } from "sonner";
// import { getLinkedUsers } from "@/services/clinic/clinic.service";

export default function RegisterProfessional() {
  const router = useRouter();
  const { user, loading: userLoading } = useAuthContext();
  const tenant = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<"professional" | "colaborator">("professional");
  const [franchises, setFranchises] = useState<any[]>([]);
  // const [linkedUsers, setLinkedUsers] = useState<any[]>([]);
  // const [linkedUserSearch, setLinkedUserSearch] = useState("");
  // const [isLinkedUserDropdownOpen, setIsLinkedUserDropdownOpen] = useState(false);
  
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
    // linkedUser: '',
  });

  useEffect(() => {
    if (!user?.clinicId) return;
    
    const clinicId = user.clinicId;
    const fetchFranchises = async () => {
      try {
        const response = await getFranchises(clinicId);
        setFranchises(response);
      } catch (error) {
        console.error("Erro ao buscar franchises:", error);
        setFranchises([]);
      }
    };

    // const fetchLinkedUsers = async () => {
    //   try {
    //     const response = await getLinkedUsers(clinicId);
    //     console.log(response);
    //     setLinkedUsers(response);
    //   } catch (error) {
    //     console.error("Erro ao buscar usuários vinculados:", error);
    //     setLinkedUsers([]);
    //   }
    // };
    
    fetchFranchises();
    // fetchLinkedUsers();
  }, [user?.clinicId]);

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
    // } else if (name === "linkedUser") {
    //   // Quando um usuário é selecionado, preencher os campos automaticamente
    //   const selectedUser = linkedUsers.find((u) => u.id === value);
    //   if (selectedUser) {
    //     setFormData((prev) => ({
    //       ...prev,
    //       linkedUser: value,
    //       name: selectedUser.name || "",
    //       cpf: selectedUser.cpf || "",
    //       email: selectedUser.email || "",
    //     }));
    //     // Reset CPF validation since it's auto-filled
    //     setCpfTouched(false);
    //     setCpfIsValid(null);
    //   }
    //   setLinkedUserSearch("");
    //   setIsLinkedUserDropdownOpen(false);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // const handleLinkedUserClear = () => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     linkedUser: "",
  //     name: "",
  //     cpf: "",
  //     email: "",
  //   }));
  //   setLinkedUserSearch("");
  //   setCpfTouched(false);
  //   setCpfIsValid(null);
  // };

  // // Filter linked users based on search
  // const filteredLinkedUsers = linkedUsers.filter((user) =>
  //   user.name?.toLowerCase().includes(linkedUserSearch.toLowerCase()) ||
  //   user.email?.toLowerCase().includes(linkedUserSearch.toLowerCase())
  // );

  // // Get selected linked user for display
  // const selectedLinkedUser = linkedUsers.find((u) => u.id === formData.linkedUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar CPF antes de submeter
    const cpfValid = validateCPF(formData.cpf);
    if (!cpfValid) {
      setCpfTouched(true);
      setCpfIsValid(false);
      return;
    }
    
    setIsLoading(true);
    if (!user) return;

    try{
      const response = await createProfessional({
        franchiseId: formData.franchiseId,
        name: formData.name,
        cpf: formData.cpf,
        email: formData.email,
        ownerId: user.id,
        council: formData.council,
        councilNumber: formData.councilNumber,
        councilState: formData.councilState,
        profession: formData.profession,
      });

      console.log(response);

      toast.success("Profissional criado com sucesso!");
      router.push(createTenantLink(tenant, "/dashboard/professionals"));

    } catch (error: any) {
      console.error("Erro ao criar profissional:", error);
      
      // Extrai a mensagem de erro do backend
      // NestJS retorna erros no formato: { statusCode, message, error }
      const errorMessage = error?.response?.data?.message 
        || error?.message 
        || "Erro ao criar profissional. Tente novamente.";
      
      toast.error(errorMessage);
    } finally{
      setIsLoading(false);
    }
  };

  // Validação do formulário
  const isFormValid = formData.name && formData.cpf && formData.email && formData.profession && formData.franchiseId && cpfIsValid === true;

  return (
    <div className="space-y-8">
        {/* Header */}
        <div>
          <button
            onClick={() => router.push(createTenantLink(tenant, "/dashboard/professionals"))}
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
                  {
                    franchises.map((franchise) => (
                      <SelectItem key={franchise.id} value={franchise.id}>{franchise.name}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>

            {/* Linked User - Searchable */}
            {/* 
            <div className="space-y-2">
              <Label htmlFor="linkedUser" className="text-foreground font-semibold">
                Usuário Vinculado (Selecione um usuário existente)
              </Label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Pesquisar usuário por nome ou e-mail..."
                    value={linkedUserSearch || selectedLinkedUser?.name || ""}
                    onChange={(e) => {
                      setLinkedUserSearch(e.target.value);
                      setIsLinkedUserDropdownOpen(true);
                      if (!e.target.value && formData.linkedUser) {
                        handleLinkedUserClear();
                      }
                    }}
                    onFocus={() => setIsLinkedUserDropdownOpen(true)}
                    className="pl-10 pr-10 h-11 bg-white border-border"
                  />
                  {formData.linkedUser && (
                    <button
                      type="button"
                      onClick={handleLinkedUserClear}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {isLinkedUserDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsLinkedUserDropdownOpen(false)}
                    />
                    <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredLinkedUsers.length > 0 ? (
                        filteredLinkedUsers.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => handleSelectChange("linkedUser", user.id)}
                            className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors border-b border-border last:border-b-0"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{user.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {user.email}
                              </span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                          Nenhum usuário encontrado
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            */}

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
