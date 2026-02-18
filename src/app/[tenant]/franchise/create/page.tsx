"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, Plus, Edit2, Trash2, ArrowRight } from "lucide-react";
import { useTenant } from "@/hooks/use-tenant";
import { createTenantLink } from "@/lib/tenant-navigation";

interface Franchise {
  id: string;
  franchiseName: string;
  address: string;
  zipCode: string;
  description?: string;
}

export default function CreateFranchise() {
  const router = useRouter();
  const tenant = useTenant();
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    franchiseName: "",
    address: "",
    zipCode: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.franchiseName.trim()) {
      newErrors.franchiseName = "Franchise name is required";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "Zip code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddFranchise = () => {
    if (!validateForm()) {
      return;
    }

    if (editingId) {
      // Update existing franchise - check for duplicates excluding current franchise
      const duplicate = franchises.find(
        (f) =>
          f.id !== editingId &&
          f.franchiseName.toLowerCase().trim() === formData.franchiseName.toLowerCase().trim() &&
          f.address.toLowerCase().trim() === formData.address.toLowerCase().trim() &&
          f.zipCode.trim() === formData.zipCode.trim()
      );

      if (duplicate) {
        setErrors({
          franchiseName: "A franchise with this name, address, and zip code already exists",
        });
        return;
      }

      // Update existing franchise
      setFranchises(
        franchises.map((f) =>
          f.id === editingId
            ? {
                ...f,
                ...formData,
              }
            : f
        )
      );
      setEditingId(null);
    } else {
      // Add new franchise - check for duplicates
      const duplicate = franchises.find(
        (f) =>
          f.franchiseName.toLowerCase().trim() === formData.franchiseName.toLowerCase().trim() &&
          f.address.toLowerCase().trim() === formData.address.toLowerCase().trim() &&
          f.zipCode.trim() === formData.zipCode.trim()
      );

      if (duplicate) {
        setErrors({
          franchiseName: "A franchise with this name, address, and zip code already exists",
        });
        return;
      }

      // Add new franchise
      const newFranchise: Franchise = {
        id: Math.random().toString(),
        ...formData,
      };
      setFranchises([...franchises, newFranchise]);
    }

    // Clear form and errors
    setFormData({
      franchiseName: "",
      address: "",
      zipCode: "",
      description: "",
    });
    setErrors({});
  };

  const handleEditFranchise = (franchise: Franchise) => {
    setFormData({
      franchiseName: franchise.franchiseName,
      address: franchise.address,
      zipCode: franchise.zipCode,
      description: franchise.description || "",
    });
    setEditingId(franchise.id);
  };

  const handleDeleteFranchise = (id: string) => {
    setFranchises(franchises.filter((f) => f.id !== id));
    if (editingId === id) {
      setFormData({
        franchiseName: "",
        address: "",
        zipCode: "",
        description: "",
      });
      setEditingId(null);
    }
  };

  const handleContinue = () => {
    if (franchises.length === 0) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      router.push(createTenantLink(tenant, "/dashboard"));
    }, 1500);
  };

  const canContinue = franchises.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">Cliniker</span>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-4 mb-6 sm:mb-8 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
                ✓
              </div>
              <span className="text-sm font-medium text-foreground">
                Criar sua clínica
              </span>
            </div>
            <div className="w-8 h-0.5 bg-primary mx-2 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="text-sm font-medium text-foreground">
                Criar unidades de franquia
              </span>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Criar suas unidades de franquia
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Adicione pelo menos uma localização para começar. Você pode gerenciar múltiplas franquias a partir do
              seu painel.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm sticky top-8">
              <h2 className="text-xl font-bold text-foreground mb-6">
                {editingId ? "Editar Franquia" : "Adicionar Franquia"}
              </h2>

              <div className="space-y-4">
                {/* Franchise Name */}
                <div className="space-y-2">
                  <Label htmlFor="franchiseName" className="text-foreground font-semibold">
                    Nome da Franquia *
                  </Label>
                  <Input
                    id="franchiseName"
                    name="franchiseName"
                    type="text"
                    placeholder="ex: Unidade Centro"
                    value={formData.franchiseName}
                    onChange={handleChange}
                    className={`h-10 bg-white border-border text-sm ${
                      errors.franchiseName ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                  />
                  {errors.franchiseName && (
                    <p className="text-sm text-red-600">{errors.franchiseName}</p>
                  )}
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-foreground font-semibold">
                    Endereço *
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="ex: Rua das Clínicas, 123"
                    value={formData.address}
                    onChange={handleChange}
                    className={`h-10 bg-white border-border text-sm ${
                      errors.address ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-600">{errors.address}</p>
                  )}
                </div>

                {/* Zip Code */}
                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="text-foreground font-semibold">
                    CEP *
                  </Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    type="text"
                    placeholder="ex: 12345-678"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className={`h-10 bg-white border-border text-sm ${
                      errors.zipCode ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                  />
                  {errors.zipCode && (
                    <p className="text-sm text-red-600">{errors.zipCode}</p>
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
                    placeholder="Detalhes sobre esta localização..."
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full border border-border rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Detalhes opcionais sobre esta localização
                  </p>
                </div>

                {/* Add Button */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleAddFranchise}
                    className="flex-1 h-10 bg-primary hover:bg-primary/90 text-white font-medium text-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {editingId ? "Atualizar" : "Adicionar Franquia"}
                  </Button>
                  {editingId && (
                    <Button
                      onClick={() => {
                        setEditingId(null);
                        setFormData({
                          franchiseName: "",
                          address: "",
                          zipCode: "",
                          description: "",
                        });
                      }}
                      variant="outline"
                      className="flex-1 h-10 border-border text-sm"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Franchise List */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">
                  Suas Franquias ({franchises.length})
                </h2>
              </div>

              {franchises.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-border p-12 text-center">
                  <div className="text-muted-foreground mb-2">
                    <Stethoscope className="w-8 h-8 mx-auto opacity-50 mb-3" />
                  </div>
                  <p className="text-foreground font-medium">Ainda não há franquias adicionadas</p>
                  <p className="text-sm text-muted-foreground">
                    Crie pelo menos uma localização para continuar
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {franchises.map((franchise) => (
                    <div
                      key={franchise.id}
                      className="bg-white rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-sm truncate">
                            {franchise.franchiseName}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {franchise.address}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {franchise.zipCode}
                          </p>
                        </div>
                      </div>

                      {franchise.description && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {franchise.description}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditFranchise(franchise)}
                          className="flex-1 p-2 text-sm font-medium text-primary hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Editar</span>
                        </button>
                        <button
                          onClick={() => handleDeleteFranchise(franchise.id)}
                          className="flex-1 p-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Excluir</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Continue Button */}
              <Button
                onClick={handleContinue}
                disabled={!canContinue || isSubmitting}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-8"
              >
                {isSubmitting ? (
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
                    Configurando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Continuar para o Painel
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>

              {!canContinue && (
                <p className="text-center text-sm text-muted-foreground">
                  Crie pelo menos uma franquia para continuar
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-white py-6 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Etapa 2 de 2 – Criar unidades de franquia
          </p>
        </div>
      </div>
    </div>
  );
}
