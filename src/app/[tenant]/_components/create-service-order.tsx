import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardWrapper from "@/components/DashboardWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Plus } from "lucide-react";

// Types
export type ServiceOrderStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "CANCELED";

export interface AppointmentItem {
  id: string;
  price: number;
  notes?: string;
}

export interface CreateServiceOrderPayload {
  status?: ServiceOrderStatus;
  appointmentItems: AppointmentItem[];
}

interface FormItem {
  appointmentItemId: string;
  price: string;
  notes: string;
}

interface FormErrors {
  [key: number]: {
    appointmentItemId?: string;
    price?: string;
  };
}

const statusOptions: ServiceOrderStatus[] = ["PENDING", "IN_PROGRESS", "DONE", "CANCELED"];

export default function CreateServiceOrder() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<ServiceOrderStatus | undefined>();
  const [items, setItems] = useState<FormItem[]>([
    { appointmentItemId: "", price: "", notes: "" },
  ]);
  const [errors, setErrors] = useState<FormErrors>({});

  // Calculate total price
  const totalPrice = items.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    return sum + price;
  }, 0);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (items.length === 0) {
      toast({
        title: "Validation Error",
        description: "You must add at least one appointment item.",
        variant: "destructive",
      });
      return false;
    }

    items.forEach((item, index) => {
      const itemErrors: { appointmentItemId?: string; price?: string } = {};

      if (!item.appointmentItemId.trim()) {
        itemErrors.appointmentItemId = "Appointment Item ID is required";
        isValid = false;
      }

      if (!item.price.trim()) {
        itemErrors.price = "Price is required";
        isValid = false;
      } else if (isNaN(parseFloat(item.price)) || parseFloat(item.price) < 0) {
        itemErrors.price = "Price must be a valid number >= 0";
        isValid = false;
      }

      if (Object.keys(itemErrors).length > 0) {
        newErrors[index] = itemErrors;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handle item change
  const handleItemChange = (index: number, field: keyof FormItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);

    // Clear error for this field when user starts typing
    if (errors[index]) {
      const newErrors = { ...errors };
      delete newErrors[index][field as keyof typeof newErrors[number]];
      if (Object.keys(newErrors[index]).length === 0) {
        delete newErrors[index];
      }
      setErrors(newErrors);
    }
  };

  // Add new item
  const addItem = () => {
    setItems([...items, { appointmentItemId: "", price: "", notes: "" }]);
  };

  // Remove item
  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);

    // Clear errors for removed item
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Build payload
    const payload: CreateServiceOrderPayload = {
      status: status || undefined,
      appointmentItems: items.map((item) => ({
        id: item.appointmentItemId,
        price: parseFloat(item.price),
        notes: item.notes || undefined,
      })),
    };

    // Mock API call
    setTimeout(() => {
      console.log("Service Order Payload:", payload);
      toast({
        title: "Success!",
        description: "Comanda criada com sucesso",
      });

      // Reset form
      setStatus(undefined);
      setItems([{ appointmentItemId: "", price: "", notes: "" }]);
      setErrors({});
      setIsLoading(false);

      // Optionally navigate after success
      // navigate("/dashboard/service-orders");
    }, 1500);
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <DashboardWrapper>
      <div className="space-y-8 px-4 md:px-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Criar Comanda</h1>
          <p className="text-muted-foreground">
            Selecione os itens do agendamento e defina o status
          </p>
        </div>

        {/* Form Card */}
        <Card className="max-w-4xl">
          <CardHeader>
            <CardTitle>Comanda</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para criar uma nova comanda
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Status Select */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-foreground font-semibold">
                  Status (Opcional)
                </Label>
                <Select
                  value={status || ""}
                  onValueChange={(value) => setStatus(value as ServiceOrderStatus)}
                >
                  <SelectTrigger id="status" className="bg-card border-border h-11">
                    <SelectValue placeholder="Selecione um status (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Se não selecionar, o backend usa o padrão
                </p>
              </div>

              {/* Appointment Items Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Itens do Agendamento</h3>
                  <Button
                    type="button"
                    onClick={addItem}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar item
                  </Button>
                </div>

                {/* Items List */}
                <div className="space-y-6">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="p-4 border border-border rounded-lg bg-slate-50/30 space-y-4"
                    >
                      {/* Item Header */}
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground">Item {index + 1}</h4>
                        <Button
                          type="button"
                          onClick={() => removeItem(index)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remover
                        </Button>
                      </div>

                      {/* Appointment Item ID */}
                      <div className="space-y-2">
                        <Label
                          htmlFor={`itemId-${index}`}
                          className="text-sm text-foreground font-medium"
                        >
                          Appointment Item ID *
                        </Label>
                        <Input
                          id={`itemId-${index}`}
                          type="text"
                          placeholder="e.g., UUID or Item ID"
                          value={item.appointmentItemId}
                          onChange={(e) =>
                            handleItemChange(index, "appointmentItemId", e.target.value)
                          }
                          className={`h-10 bg-card ${
                            errors[index]?.appointmentItemId
                              ? "border-destructive focus-visible:ring-destructive"
                              : "border-border"
                          }`}
                        />
                        {errors[index]?.appointmentItemId && (
                          <p className="text-xs text-destructive">
                            {errors[index].appointmentItemId}
                          </p>
                        )}
                      </div>

                      {/* Price */}
                      <div className="space-y-2">
                        <Label
                          htmlFor={`price-${index}`}
                          className="text-sm text-foreground font-medium"
                        >
                          Valor *
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            R$
                          </span>
                          <Input
                            id={`price-${index}`}
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            value={item.price}
                            onChange={(e) =>
                              handleItemChange(index, "price", e.target.value)
                            }
                            className={`h-10 bg-card pl-8 ${
                              errors[index]?.price
                                ? "border-destructive focus-visible:ring-destructive"
                                : "border-border"
                            }`}
                          />
                        </div>
                        {errors[index]?.price && (
                          <p className="text-xs text-destructive">{errors[index].price}</p>
                        )}
                      </div>

                      {/* Notes */}
                      <div className="space-y-2">
                        <Label
                          htmlFor={`notes-${index}`}
                          className="text-sm text-foreground font-medium"
                        >
                          Observações (Opcional)
                        </Label>
                        <Textarea
                          id={`notes-${index}`}
                          placeholder="Adicione notas sobre este item..."
                          value={item.notes}
                          onChange={(e) =>
                            handleItemChange(index, "notes", e.target.value)
                          }
                          className="h-24 resize-none bg-card border-border"
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="border-t border-border pt-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="text-foreground font-medium">
                    R$ {totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-primary/5 p-3 rounded-lg">
                  <span className="font-semibold text-foreground">Total da Comanda:</span>
                  <span className="text-lg font-bold text-primary">
                    R$ {totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-6 border-t border-border">
                <Button
                  type="button"
                  onClick={handleCancel}
                  variant="outline"
                  className="h-11"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="h-11 bg-primary hover:bg-primary/90 text-white font-medium"
                  disabled={isLoading || items.length === 0}
                >
                  {isLoading ? "Criando comanda..." : "Criar Comanda"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardWrapper>
  );
}
