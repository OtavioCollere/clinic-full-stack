"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export default function RegisterPatient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    cpf: "",
    birthDate: "",
    address: "",
    zipCode: "",
    phone: "",
    email: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard/patients");
    }, 1500);
  };

  const isFormValid = formData.fullName && formData.cpf && formData.birthDate && formData.address && formData.zipCode && formData.phone;

  return (  
      <div className="space-y-8">
        {/* Header */}
        <div>
          <button
            onClick={() => router.push("/dashboard/patients")}
            className="flex items-center gap-2 text-primary hover:text-primary/90 font-medium mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Pacientes
          </button>
          <h1 className="text-3xl font-bold text-foreground mb-2">Cadastrar Paciente</h1>
          <p className="text-muted-foreground">Adicione um novo paciente à sua clínica</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-border p-8 shadow-sm max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-foreground font-semibold">
                Nome Completo *
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="e.g., John Doe"
                value={formData.fullName}
                onChange={handleChange}
                className="h-11 bg-white border-border"
                required
              />
            </div>

            {/* CPF */}
            <div className="space-y-2">
              <Label htmlFor="cpf" className="text-foreground font-semibold">
                CPF *
              </Label>
              <Input
                id="cpf"
                name="cpf"
                type="text"
                placeholder="e.g., 123.456.789-00"
                value={formData.cpf}
                onChange={handleChange}
                className="h-11 bg-white border-border"
                required
              />
            </div>

            {/* Birth Date */}
            <div className="space-y-2">
              <Label htmlFor="birthDate" className="text-foreground font-semibold">
                Data de Nascimento *
              </Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                className="h-11 bg-white border-border"
                required
              />
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
                placeholder="e.g., 123 Main Street, Apt 456"
                value={formData.address}
                onChange={handleChange}
                className="h-11 bg-white border-border"
                required
              />
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
                placeholder="e.g., 12345-678"
                value={formData.zipCode}
                onChange={handleChange}
                className="h-11 bg-white border-border"
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground font-semibold">
                Telefone *
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="e.g., (11) 98765-4321"
                value={formData.phone}
                onChange={handleChange}
                className="h-11 bg-white border-border"
                required
              />
            </div>

            {/* Email (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-semibold">
                E-mail 
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="e.g., john@email.com"
                value={formData.email}
                onChange={handleChange}
                className="h-11 bg-white border-border"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-medium disabled:opacity-50"
            >
              {isLoading ? "Criando Paciente..." : "Criar Paciente"}
            </Button>
          </form>
        </div>
      </div>
  );
}
