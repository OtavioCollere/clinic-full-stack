"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type {
  InventoryCategory,
  InventoryItem,
  UnitType,
} from "@/services/inventory/inventory.service";
import {
  createInventoryItem,
  INVENTORY_CATEGORY_LABELS,
  updateInventoryItem,
} from "@/services/inventory/inventory.service";

const UNIT_TYPES: { value: UnitType; label: string }[] = [
  { value: "UNIDADE", label: "Unidade" },
  { value: "ML", label: "mL" },
  { value: "FRASCO", label: "Frasco" },
  { value: "SERINGA", label: "Seringa" },
  { value: "AMPOLA", label: "Ampola" },
  { value: "CAIXA", label: "Caixa" },
  { value: "OUTRO", label: "Outro" },
];

const INVENTORY_CATEGORIES: { value: InventoryCategory; label: string }[] = [
  { value: "PREENCHEDOR", label: INVENTORY_CATEGORY_LABELS.PREENCHEDOR },
  {
    value: "TOXINA_BOTULINICA",
    label: INVENTORY_CATEGORY_LABELS.TOXINA_BOTULINICA,
  },
  { value: "ANESTESICO", label: INVENTORY_CATEGORY_LABELS.ANESTESICO },
  { value: "BIOESTIMULADOR", label: INVENTORY_CATEGORY_LABELS.BIOESTIMULADOR },
  { value: "FIOS", label: INVENTORY_CATEGORY_LABELS.FIOS },
  { value: "PEELING", label: INVENTORY_CATEGORY_LABELS.PEELING },
  { value: "SKINCARE", label: INVENTORY_CATEGORY_LABELS.SKINCARE },
  {
    value: "MATERIAL_DESCARTAVEL",
    label: INVENTORY_CATEGORY_LABELS.MATERIAL_DESCARTAVEL,
  },
  { value: "MEDICAMENTO", label: INVENTORY_CATEGORY_LABELS.MEDICAMENTO },
  { value: "OUTRO", label: INVENTORY_CATEGORY_LABELS.OUTRO },
];

interface Props {
  clinicId: string;
  item?: InventoryItem | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function InventoryItemModal({
  clinicId,
  item,
  onClose,
  onSaved,
}: Props) {
  const isEdit = !!item;
  const [name, setName] = useState(item?.name ?? "");
  const [category, setCategory] = useState<InventoryCategory>(
    item?.category ?? "PREENCHEDOR",
  );
  const [unitType, setUnitType] = useState<UnitType>(
    item?.unitType ?? "UNIDADE",
  );
  const [minimumQuantity, setMinimumQuantity] = useState(
    String(item?.minimumQuantity ?? "0"),
  );
  const [supplier, setSupplier] = useState(item?.supplier ?? "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nome obrigatorio");
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        name: name.trim(),
        category,
        unitType,
        minimumQuantity: parseFloat(minimumQuantity) || 0,
        supplier: supplier.trim() || undefined,
      };
      if (isEdit && item) {
        await updateInventoryItem(clinicId, item.id, payload);
        toast.success("Insumo atualizado com sucesso");
      } else {
        await createInventoryItem(clinicId, payload);
        toast.success("Insumo cadastrado com sucesso");
      }
      onSaved();
    } catch {
      toast.error("Erro ao salvar insumo");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {isEdit ? "Editar Insumo" : "Novo Insumo"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Nome *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Ácido Hialurônico"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Categoria *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as InventoryCategory)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {INVENTORY_CATEGORIES.map((categoryOption) => (
                <option key={categoryOption.value} value={categoryOption.value}>
                  {categoryOption.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Unidade de medida
            </label>
            <select
              value={unitType}
              onChange={(e) => setUnitType(e.target.value as UnitType)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {UNIT_TYPES.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Estoque mínimo
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={minimumQuantity}
              onChange={(e) => setMinimumQuantity(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Fornecedor
            </label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="Nome do fornecedor (opcional)"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-white hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : isEdit ? "Salvar" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
