"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../_components/dashboard-layout";
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
import { ArrowLeft } from "lucide-react";
import { useTenant } from "@/hooks/use-tenant";
import { createTenantLink } from "@/lib/tenant-navigation";

export default function CreateProcedure() {
  const router = useRouter();
  const tenant = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    franchise: "",
    procedureName: "",
    price: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
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
      router.push(createTenantLink(tenant, "/dashboard/procedures"));
    }, 1500);
  };

  const isFormValid = formData.franchise && formData.procedureName && formData.price;

  return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <button
            onClick={() => router.push(createTenantLink(tenant, "/dashboard/procedures"))}
            className="flex items-center gap-2 text-primary hover:text-primary/90 font-medium mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Procedimentos
          </button>
          <h1 className="text-3xl font-bold text-foreground mb-2">Criar Procedimento</h1>
          <p className="text-muted-foreground">Adicione um novo procedimento à sua clínica</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-border p-8 shadow-sm max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Franchise */}
            <div className="space-y-2">
              <Label htmlFor="franchise" className="text-foreground font-semibold">
                Franquia *
              </Label>
              <Select value={formData.franchise} onValueChange={(value) =>
                handleSelectChange("franchise", value)
              }>
                <SelectTrigger id="franchise" className="bg-white border-border h-11">
                  <SelectValue placeholder="Selecione uma franquia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="downtown">Downtown Unit</SelectItem>
                  <SelectItem value="uptown">Uptown Unit</SelectItem>
                  <SelectItem value="mall">Shopping Mall Unit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Procedure Name */}
            <div className="space-y-2">
              <Label htmlFor="procedureName" className="text-foreground font-semibold">
                Nome do Procedimento *
              </Label>
              <Input
                id="procedureName"
                name="procedureName"
                type="text"
                placeholder="e.g., Teeth Cleaning"
                value={formData.procedureName}
                onChange={handleChange}
                className="h-11 bg-white border-border"
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-foreground font-semibold">
                Preço (R$) *
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                placeholder="e.g., 75.00"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                className="h-11 bg-white border-border"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-foreground font-semibold">
                Observações (Opcional)
              </Label>
              <textarea
                id="notes"
                name="notes"
                placeholder="Add details about this procedure..."
                value={formData.notes}
                onChange={handleChange}
                className="w-full border border-border rounded-lg p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Detalhes opcionais visíveis para sua equipe
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-medium disabled:opacity-50"
            >
              {isLoading ? "Criando Procedimento..." : "Criar Procedimento"}
            </Button>
          </form>
        </div>
      </div>
  );
}
