"use client";

import { AlertTriangle, PackageCheck, SkipForward, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ConsumptionSuggestion } from "@/services/inventory/inventory.service";
import {
  confirmConsumption,
  getConsumptionSuggestion,
} from "@/services/inventory/inventory.service";

interface Props {
  clinicId: string;
  serviceOrderId: string;
  onClose: () => void;
}

interface SuggestionRow extends ConsumptionSuggestion {
  qty: string;
}

export default function ConsumptionConfirmModal({
  clinicId,
  serviceOrderId,
  onClose,
}: Props) {
  const [rows, setRows] = useState<SuggestionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getConsumptionSuggestion(clinicId, serviceOrderId)
      .then((suggestions) => {
        setRows(
          suggestions.map((suggestion) => ({
            ...suggestion,
            qty: String(suggestion.suggestedQuantity ?? 0),
          })),
        );
      })
      .catch(() => {
        toast.error("Erro ao buscar sugestão de consumo");
        setRows([]);
      })
      .finally(() => setIsLoading(false));
  }, [clinicId, serviceOrderId]);

  async function handleConfirm() {
    const items = rows
      .map((r) => ({
        inventoryItemId: r.inventoryItemId,
        quantity: parseFloat(r.qty) || 0,
      }))
      .filter((i) => i.quantity > 0);

    if (items.length === 0) {
      await handleSkip();
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await confirmConsumption(clinicId, serviceOrderId, {
        items,
      });
      toast.success(result.message);
      onClose();
    } catch {
      toast.error("Erro ao confirmar consumo");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSkip() {
    setIsSubmitting(true);
    try {
      await confirmConsumption(clinicId, serviceOrderId, { skip: true });
      toast.info("Consumo de insumos ignorado");
      onClose();
    } catch {
      toast.error("Erro ao ignorar consumo");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              Confirmar Consumo de Insumos
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {isLoading && (
            <p className="text-center text-sm text-muted-foreground py-6">
              Carregando sugestões...
            </p>
          )}

          {!isLoading && rows.length === 0 && (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-4">
                Nenhuma sugestão de consumo encontrada para os procedimentos
                desta comanda.
              </p>
              <Button onClick={onClose} variant="outline" size="sm">
                Fechar
              </Button>
            </div>
          )}

          {!isLoading && rows.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Confirme ou ajuste as quantidades consumidas nos procedimentos
                realizados.
              </p>

              <div className="space-y-2">
                {rows.map((row, idx) => (
                  <div
                    key={row.inventoryItemId}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {row.inventoryItemName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Estoque atual: {Number(row.currentStock).toFixed(2)}{" "}
                        {row.unitType}
                        {Number(row.currentStock) < Number(row.qty || 0) && (
                          <span className="ml-2 text-red-500 inline-flex items-center gap-0.5">
                            <AlertTriangle className="w-3 h-3" /> insuficiente
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.qty}
                        onChange={(e) => {
                          const updated = [...rows];
                          updated[idx] = {
                            ...updated[idx],
                            qty: e.target.value,
                          };
                          setRows(updated);
                        }}
                        className="w-20 px-2 py-1 text-sm text-right rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <span className="text-xs text-muted-foreground w-12">
                        {row.unitType}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSkip}
                  disabled={isSubmitting}
                  className="gap-1.5 text-muted-foreground"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  Ignorar consumo
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  size="sm"
                  className="flex-1 gap-1.5 bg-primary text-white hover:bg-primary/90"
                >
                  <PackageCheck className="w-3.5 h-3.5" />
                  {isSubmitting ? "Confirmando..." : "Confirmar baixa"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
