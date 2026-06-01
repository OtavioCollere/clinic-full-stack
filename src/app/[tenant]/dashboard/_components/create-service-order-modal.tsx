"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { getProceduresByClinicId } from "@/services/procedures/procedure.service";
import { createServiceOrder, type PaymentMethod } from "@/services/service-order/service-order.service";
import type { Appointment } from "@/services/appointments/appointment.service";
import { toast } from "sonner";
import ConsumptionConfirmModal from "./consumption-confirm-modal";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProcedureFormItem {
  appointmentItemId: string;
  procedureId: string;
  price: string;
  notes: string;
}

interface Procedure {
  id: string;
  name: string;
  price: number | string;
}

interface ProcedureFormErrors {
  [key: number]: { procedure?: string; price?: string };
}

interface CreateServiceOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  onSuccess?: () => void;
}

const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
  { value: "credit_card", label: "Cartão de crédito" },
  { value: "debit_card", label: "Cartão de débito" },
  { value: "pix", label: "PIX" },
  { value: "bank_transfer", label: "Transferência bancária" },
  { value: "cash", label: "Dinheiro" },
  { value: "other", label: "Outro" },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function CreateServiceOrderModal({
  isOpen,
  onClose,
  appointment,
  onSuccess,
}: CreateServiceOrderModalProps) {
  const { user } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProcedures, setIsLoadingProcedures] = useState(false);
  const [consumptionServiceOrderId, setConsumptionServiceOrderId] = useState<string | null>(null);

  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [procedureItems, setProcedureItems] = useState<ProcedureFormItem[]>([]);
  const [procedureErrors, setProcedureErrors] = useState<ProcedureFormErrors>({});

  // ─── Fetch procedures when modal opens ───────────────────────────────────

  useEffect(() => {
    if (!isOpen || !user?.clinicId) return;

    setIsLoadingProcedures(true);
    getProceduresByClinicId(user.clinicId as string)
      .then((data) => setProcedures(data ?? []))
      .catch(() => toast.error("Erro ao carregar procedimentos."))
      .finally(() => setIsLoadingProcedures(false));
  }, [isOpen, user?.clinicId]);

  // ─── Reset on open ───────────────────────────────────────────────────────

  useEffect(() => {
    if (isOpen && appointment) {
      setPaymentMethod("cash");
      setProcedureErrors({});
      setProcedureItems(
        appointment.appointmentItems.map((ai) => ({
          appointmentItemId: ai.id,
          procedureId: ai.procedureId,
          price: String(typeof ai.price === "number" ? ai.price : parseFloat(String(ai.price)) || 0),
          notes: ai.notes ?? "",
        }))
      );
    }
  }, [isOpen, appointment?.id]);

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const toNumber = (val: number | string) =>
    typeof val === "number" ? val : parseFloat(String(val)) || 0;

  const getProcedureName = (id: string) =>
    procedures.find((p) => p.id === id)?.name ?? "Procedimento";

  const totalPrice = procedureItems.reduce((s, i) => s + (parseFloat(i.price) || 0), 0);

  // ─── Procedure item handlers ──────────────────────────────────────────────

  const groupedByProcedure = useMemo(() => {
    const groups = new Map<string, { procedureId: string; procedureName: string; indices: number[]; totalPrice: number }>();
    procedureItems.forEach((item, index) => {
      if (!item.procedureId) return;
      const name = getProcedureName(item.procedureId);
      const price = parseFloat(item.price) || 0;
      if (!groups.has(item.procedureId)) {
        groups.set(item.procedureId, { procedureId: item.procedureId, procedureName: name, indices: [], totalPrice: 0 });
      }
      const g = groups.get(item.procedureId)!;
      g.indices.push(index);
      g.totalPrice += price;
    });
    return Array.from(groups.values());
  }, [procedureItems, procedures]);

  const emptyProcedureIndices = useMemo(
    () => procedureItems.map((item, idx) => (!item.procedureId ? idx : -1)).filter((i) => i >= 0),
    [procedureItems]
  );

  const handleAddProcedureItem = () => {
    setProcedureItems([...procedureItems, { appointmentItemId: "", procedureId: "", price: "", notes: "" }]);
  };

  const handleSelectProcedure = (index: number, procedureId: string) => {
    const proc = procedures.find((p) => p.id === procedureId);
    if (!proc) return;
    const newItems = [...procedureItems];
    newItems[index] = { ...newItems[index], procedureId: proc.id, price: String(toNumber(proc.price)) };
    setProcedureItems(newItems);
    if (procedureErrors[index]) {
      const e = { ...procedureErrors };
      delete e[index];
      setProcedureErrors(e);
    }
  };

  const handleProcedureItemChange = (index: number, field: keyof ProcedureFormItem, value: string) => {
    const newItems = [...procedureItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setProcedureItems(newItems);
  };

  const handleRemoveProcedureItem = (index: number) => {
    setProcedureItems(procedureItems.filter((_, i) => i !== index));
    const e = { ...procedureErrors };
    delete e[index];
    setProcedureErrors(e);
  };

  // ─── Validation ──────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const validProc = procedureItems.filter((i) => i.procedureId);

    if (validProc.length === 0) {
      toast.error("Adicione pelo menos um procedimento.");
      return false;
    }

    let isValid = true;
    const procErrors: ProcedureFormErrors = {};
    procedureItems.forEach((item, index) => {
      if (!item.procedureId) return;
      if (!item.price.trim() || isNaN(parseFloat(item.price)) || parseFloat(item.price) < 0) {
        procErrors[index] = { price: "Preço deve ser um número >= 0" };
        isValid = false;
      }
    });
    setProcedureErrors(procErrors);

    return isValid;
  };

  // ─── Submit ──────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const allItems = procedureItems
      .filter((i) => i.procedureId)
      .map((i) => ({
        appointmentItemId: i.appointmentItemId || undefined,
        procedureId: i.procedureId,
        price: parseFloat(i.price) || 0,
        notes: i.notes || undefined,
      }));

    setIsSubmitting(true);
    try {
      const order = await createServiceOrder({
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        items: allItems,
        status: "PAID",
        paymentMethod,
      });
      toast.success("Comanda criada com sucesso!");
      onSuccess?.();
      setConsumptionServiceOrderId(order.id);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err?.response?.data?.message ?? err?.message ?? "Erro ao criar comanda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  if (consumptionServiceOrderId && user?.clinicId) {
    return (
      <ConsumptionConfirmModal
        clinicId={user.clinicId as string}
        serviceOrderId={consumptionServiceOrderId}
        onClose={() => { setConsumptionServiceOrderId(null); onClose(); }}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Comanda</DialogTitle>
          <DialogDescription>
            Confirme a consulta criando uma comanda a partir dos procedimentos do agendamento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Agendamento:</span> {appointment.name} •{" "}
            {appointment.patientName ?? "Paciente"}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment method */}
            <div className="space-y-2">
              <Label className="text-foreground font-semibold">Forma de pagamento</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                <SelectTrigger className="bg-card border-border h-10">
                  <SelectValue placeholder="Selecione a forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethodOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <hr className="border-border" />

            {/* ── Procedures ── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Procedimentos</h3>
                <Button
                  type="button"
                  onClick={handleAddProcedureItem}
                  variant="outline"
                  size="sm"
                  disabled={procedures.length === 0 || isLoadingProcedures}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar procedimento
                </Button>
              </div>

              {procedureItems.length === 0 && (
                <div className="text-center py-6 bg-secondary/50 rounded-lg border border-dashed border-border">
                  <p className="text-sm text-muted-foreground">
                    Este agendamento não possui procedimentos cadastrados.
                  </p>
                </div>
              )}

              {/* Grouped procedures */}
              {groupedByProcedure.map((group) => (
                <div key={group.procedureId} className="p-4 border border-border rounded-lg bg-slate-50/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">
                      {group.procedureName}
                      {group.indices.length > 1 && (
                        <span className="text-muted-foreground text-sm ml-1">({group.indices.length}x)</span>
                      )}
                    </span>
                    <Button
                      type="button"
                      onClick={() => handleRemoveProcedureItem(group.indices[group.indices.length - 1])}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remover
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {group.indices.map((itemIndex, i) => (
                      <div key={itemIndex} className="flex items-center gap-2">
                        {group.indices.length > 1 && (
                          <span className="text-sm text-muted-foreground w-12 shrink-0">Item {i + 1}</span>
                        )}
                        <Label className="text-sm text-muted-foreground shrink-0">Valor</Label>
                        <div className="relative w-36">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={procedureItems[itemIndex].price}
                            onChange={(e) => handleProcedureItemChange(itemIndex, "price", e.target.value)}
                            className="pl-8 h-9 bg-card border-border"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {group.indices.length > 1 && (
                    <div className="text-sm font-semibold text-primary text-right">
                      Total: R$ {group.totalPrice.toFixed(2)}
                    </div>
                  )}
                </div>
              ))}

              {/* Empty procedure rows */}
              {emptyProcedureIndices.map((index) => {
                const item = procedureItems[index];
                return (
                  <div key={`empty-proc-${index}`} className="p-4 border border-border rounded-lg bg-slate-50/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground">Novo procedimento</h4>
                      <Button type="button" onClick={() => handleRemoveProcedureItem(index)} variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" /> Cancelar
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Procedimento *</Label>
                      <Select value={item.procedureId} onValueChange={(v) => handleSelectProcedure(index, v)}>
                        <SelectTrigger className={`bg-card h-10 ${procedureErrors[index]?.procedure ? "border-destructive" : "border-border"}`}>
                          <SelectValue placeholder="Selecione um procedimento" />
                        </SelectTrigger>
                        <SelectContent>
                          {procedures.map((proc) => (
                            <SelectItem key={proc.id} value={proc.id}>
                              {proc.name} — R$ {toNumber(proc.price).toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Valor *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={item.price}
                          onChange={(e) => handleProcedureItemChange(index, "price", e.target.value)}
                          className={`pl-8 h-10 bg-card ${procedureErrors[index]?.price ? "border-destructive" : "border-border"}`}
                        />
                      </div>
                      {procedureErrors[index]?.price && (
                        <p className="text-xs text-destructive">{procedureErrors[index].price}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Observações</Label>
                      <Textarea
                        placeholder="Observações..."
                        value={item.notes}
                        onChange={(e) => handleProcedureItemChange(index, "notes", e.target.value)}
                        className="h-20 resize-none bg-card border-border"
                        rows={2}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            {procedureItems.length > 0 && (
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center bg-primary/5 p-3 rounded-lg">
                  <span className="font-semibold text-foreground">Total:</span>
                  <span className="text-lg font-bold text-primary">R$ {totalPrice.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || procedureItems.length === 0}
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
              >
                {isSubmitting ? "Criando..." : "Criar Comanda"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
