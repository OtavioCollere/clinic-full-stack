"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { InventoryItem } from "@/services/inventory/inventory.service";
import {
  createInventoryEntry,
  INVENTORY_CATEGORY_LABELS,
} from "@/services/inventory/inventory.service";

interface Props {
  clinicId: string;
  items: InventoryItem[];
  preselectedItemId?: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function InventoryEntryModal({
  clinicId,
  items,
  preselectedItemId,
  onClose,
  onSaved,
}: Props) {
  const [inventoryItemId, setInventoryItemId] = useState(
    preselectedItemId ?? "",
  );
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [supplier, setSupplier] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [notes, setNotes] = useState("");
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
    if (!inventoryItemId) {
      toast.error("Selecione o insumo");
      return;
    }
    const qty = parseFloat(quantity);
    const cost = parseFloat(unitCost);
    if (!qty || qty <= 0) {
      toast.error("Quantidade deve ser maior que zero");
      return;
    }
    if (!cost || cost < 0) {
      toast.error("Custo unitário inválido");
      return;
    }

    setIsLoading(true);
    try {
      await createInventoryEntry(clinicId, {
        inventoryItemId,
        quantity: qty,
        unitCost: cost,
        supplier: supplier.trim() || undefined,
        invoiceNumber: invoiceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      toast.success("Entrada registrada com sucesso");
      onSaved();
    } catch {
      toast.error("Erro ao registrar entrada");
    } finally {
      setIsLoading(false);
    }
  }

  const selectedItem = items.find((i) => i.id === inventoryItemId);

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
            Registrar Entrada de Estoque
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
              Insumo *
            </label>
            <select
              value={inventoryItemId}
              onChange={(e) => setInventoryItemId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecione o insumo...</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} (
                  {INVENTORY_CATEGORY_LABELS[item.category] ?? item.category})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Quantidade *{selectedItem ? ` (${selectedItem.unitType})` : ""}
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Custo unitário (R$) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {quantity && unitCost && (
            <p className="text-sm text-muted-foreground">
              Total da entrada:{" "}
              <span className="font-semibold text-foreground">
                R$ {(parseFloat(quantity) * parseFloat(unitCost)).toFixed(2)}
              </span>
            </p>
          )}

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

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Nota fiscal / NF
            </label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="Número da nota (opcional)"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Observações
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Observações opcionais..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
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
              {isLoading ? "Registrando..." : "Registrar Entrada"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
