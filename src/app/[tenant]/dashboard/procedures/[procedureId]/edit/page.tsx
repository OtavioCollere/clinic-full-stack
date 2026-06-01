"use client";

import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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
import { useAuthContext } from "@/context/AuthContext";
import { useTenant } from "@/hooks/use-tenant";
import { createTenantLink } from "@/lib/tenant-navigation";
import { getFranchises } from "@/services/franchise/franchise.service";
import {
  deleteSupplyTemplate,
  type InventoryItem,
  listInventoryItems,
  listSupplyTemplates,
  type ProcedureSupplyTemplate,
  upsertSupplyTemplate,
} from "@/services/inventory/inventory.service";
import {
  deleteProcedure,
  getProcedureById,
  updateProcedure,
} from "@/services/procedures/procedure.service";

type SupplyRow = {
  templateId?: string;
  inventoryItemId: string;
  defaultQuantity: string;
  unitCost: string;
};

type Franchise = {
  id: string;
  name: string;
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
  message?: string;
};

const getApiError = (error: unknown) => error as ApiError;

const getErrorMessage = (error: unknown, fallback: string) => {
  const apiError = getApiError(error);
  return apiError?.response?.data?.message || apiError?.message || fallback;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

const resolveUnitCost = (rowUnitCost: string, defaultCost: number) => {
  if (rowUnitCost.trim() === "") return defaultCost;
  const parsedCost = parseFloat(rowUnitCost);
  return Number.isFinite(parsedCost) ? parsedCost : defaultCost;
};

export default function EditProcedure() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthContext();
  const tenant = useTenant();
  const procedureId = params?.procedureId as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [initialTemplates, setInitialTemplates] = useState<
    ProcedureSupplyTemplate[]
  >([]);
  const [supplyRows, setSupplyRows] = useState<SupplyRow[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [priceWasEdited, setPriceWasEdited] = useState(false);

  const [formData, setFormData] = useState({
    franchiseId: "",
    procedureName: "",
    price: "",
    notes: "",
  });

  useEffect(() => {
    if (!procedureId || !user?.clinicId) {
      setIsLoadingData(false);
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoadingData(true);

        const [
          procedureResponse,
          franchisesResponse,
          inventoryResponse,
          templatesResponse,
        ] = await Promise.all([
          getProcedureById(procedureId),
          getFranchises(user.clinicId as string),
          listInventoryItems(user.clinicId as string),
          listSupplyTemplates(user.clinicId as string, procedureId),
        ]);

        if (!isMounted) return;

        setFranchises(franchisesResponse);
        setInventoryItems(
          Array.isArray(inventoryResponse) ? inventoryResponse : [],
        );
        setInitialTemplates(
          Array.isArray(templatesResponse) ? templatesResponse : [],
        );
        const loadedInventoryItems = Array.isArray(inventoryResponse)
          ? inventoryResponse
          : [];
        setSupplyRows(
          Array.isArray(templatesResponse)
            ? templatesResponse.map((template) => ({
                templateId: template.id,
                inventoryItemId: template.inventoryItemId,
                defaultQuantity: String(template.defaultQuantity),
                unitCost: String(
                  loadedInventoryItems.find(
                    (item) => item.id === template.inventoryItemId,
                  )?.averageCost || 0,
                ),
              }))
            : [],
        );

        if (procedureResponse) {
          // Tratar o preço que pode vir como number, string ou Decimal
          let priceValue = "";
          if (
            procedureResponse.price !== null &&
            procedureResponse.price !== undefined
          ) {
            if (typeof procedureResponse.price === "number") {
              priceValue = procedureResponse.price.toString();
            } else if (typeof procedureResponse.price === "string") {
              priceValue = procedureResponse.price;
            } else {
              // Pode ser um objeto Decimal do Prisma
              priceValue = String(procedureResponse.price);
            }
          }

          setFormData({
            franchiseId: procedureResponse.franchiseId || "",
            procedureName: procedureResponse.name || "",
            price: priceValue,
            notes: procedureResponse.notes || "",
          });
        } else {
          toast.error("Procedimento não encontrado");
          setTimeout(() => {
            router.push(createTenantLink(tenant, "/dashboard/procedures"));
          }, 1500);
        }
      } catch (error: unknown) {
        if (!isMounted) return;

        console.error("Erro ao carregar dados:", error);
        const apiError = getApiError(error);
        const errorMessage = getErrorMessage(
          error,
          "Erro ao carregar procedimento",
        );
        toast.error(errorMessage);

        // Só redireciona se for erro 404 (não encontrado)
        if (apiError?.response?.status === 404) {
          setTimeout(() => {
            router.push(createTenantLink(tenant, "/dashboard/procedures"));
          }, 1500);
        }
      } finally {
        if (isMounted) {
          setIsLoadingData(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [procedureId, router, tenant, user?.clinicId]);

  const selectedSupplyCost = useMemo(() => {
    return supplyRows.reduce((sum, row) => {
      const item = inventoryItems.find(
        (inventoryItem) => inventoryItem.id === row.inventoryItemId,
      );
      const quantity = parseFloat(row.defaultQuantity) || 0;
      const unitCost = resolveUnitCost(
        row.unitCost,
        Number(item?.averageCost || 0),
      );
      return sum + quantity * unitCost;
    }, 0);
  }, [inventoryItems, supplyRows]);

  useEffect(() => {
    if (priceWasEdited || supplyRows.length === 0 || selectedSupplyCost <= 0)
      return;
    if (formData.price) return;

    setFormData((prev) => ({
      ...prev,
      price: selectedSupplyCost.toFixed(2),
    }));
  }, [formData.price, priceWasEdited, selectedSupplyCost, supplyRows.length]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "price") {
      setPriceWasEdited(true);
    }
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

  const handleAddSupply = () => {
    setSupplyRows((prev) => [
      ...prev,
      { inventoryItemId: "", defaultQuantity: "1", unitCost: "" },
    ]);
  };

  const handleSupplyChange = (
    index: number,
    field: keyof SupplyRow,
    value: string,
  ) => {
    setSupplyRows((prev) =>
      prev.map((row, rowIndex) => {
        if (rowIndex !== index) return row;

        if (field === "inventoryItemId") {
          const selectedItem = inventoryItems.find((item) => item.id === value);
          return {
            ...row,
            inventoryItemId: value,
            unitCost: selectedItem
              ? String(selectedItem.averageCost || 0)
              : row.unitCost,
          };
        }

        return { ...row, [field]: value };
      }),
    );
  };

  const handleRemoveSupply = (index: number) => {
    setSupplyRows((prev) => prev.filter((_, rowIndex) => rowIndex !== index));
  };

  const applySuggestedPrice = () => {
    setPriceWasEdited(true);
    setFormData((prev) => ({
      ...prev,
      price: selectedSupplyCost.toFixed(2),
    }));
  };

  const validSupplyRows = Object.values(
    supplyRows.reduce<Record<string, SupplyRow>>((acc, row) => {
      const quantity = parseFloat(row.defaultQuantity) || 0;
      if (!row.inventoryItemId || quantity <= 0) return acc;

      const existingQuantity =
        parseFloat(acc[row.inventoryItemId]?.defaultQuantity ?? "0") || 0;
      acc[row.inventoryItemId] = {
        inventoryItemId: row.inventoryItemId,
        defaultQuantity: String(existingQuantity + quantity),
        unitCost: row.unitCost,
      };

      return acc;
    }, {}),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateProcedure(procedureId, {
        name: formData.procedureName,
        price: parseFloat(formData.price),
        notes: formData.notes || undefined,
      });

      if (user?.clinicId) {
        const removedTemplates = initialTemplates.filter(
          (template) =>
            !validSupplyRows.some(
              (row) => row.inventoryItemId === template.inventoryItemId,
            ),
        );

        await Promise.all([
          ...removedTemplates.map((template) =>
            deleteSupplyTemplate(user.clinicId as string, template.id),
          ),
          ...validSupplyRows.map((row) =>
            upsertSupplyTemplate(user.clinicId as string, {
              procedureId,
              inventoryItemId: row.inventoryItemId,
              defaultQuantity: parseFloat(row.defaultQuantity),
              isRequired: true,
            }),
          ),
        ]);
      }

      toast.success("Procedimento atualizado com sucesso!");
      router.push(createTenantLink(tenant, "/dashboard/procedures"));
    } catch (error: unknown) {
      console.error("Erro ao atualizar procedimento:", error);
      const errorMessage = getErrorMessage(
        error,
        "Erro ao atualizar procedimento. Tente novamente.",
      );
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!procedureId) return;

    setIsDeleting(true);
    try {
      await deleteProcedure(procedureId);
      toast.success("Procedimento excluído com sucesso!");
      router.push(createTenantLink(tenant, "/dashboard/procedures"));
    } catch (error: unknown) {
      console.error("Erro ao excluir procedimento:", error);
      const errorMessage = getErrorMessage(
        error,
        "Erro ao excluir procedimento. Tente novamente.",
      );
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const isFormValid =
    formData.franchiseId &&
    formData.procedureName &&
    formData.price &&
    parseFloat(formData.price) > 0;

  if (isLoadingData) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando procedimento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() =>
            router.push(createTenantLink(tenant, "/dashboard/procedures"))
          }
          className="flex items-center gap-2 text-primary hover:text-primary/90 font-medium mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Procedimentos
        </button>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Editar Procedimento
        </h1>
        <p className="text-muted-foreground">
          Atualize as informações do procedimento
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-card rounded-xl border border-border p-8 shadow-sm max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Franchise */}
          <div className="space-y-2">
            <Label
              htmlFor="franchise"
              className="text-foreground font-semibold"
            >
              Franquia *
            </Label>
            <Select
              value={formData.franchiseId}
              onValueChange={(value) =>
                handleSelectChange("franchiseId", value)
              }
              disabled
            >
              <SelectTrigger
                id="franchise"
                className="bg-gray-50 border-border h-11 cursor-not-allowed"
              >
                <SelectValue placeholder="Selecione uma franquia" />
              </SelectTrigger>
              <SelectContent>
                {franchises.map((franchise) => (
                  <SelectItem key={franchise.id} value={franchise.id}>
                    {franchise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              A franquia não pode ser alterada após a criação
            </p>
          </div>

          {/* Procedure Name */}
          <div className="space-y-2">
            <Label
              htmlFor="procedureName"
              className="text-foreground font-semibold"
            >
              Nome do Procedimento *
            </Label>
            <Input
              id="procedureName"
              name="procedureName"
              type="text"
              placeholder="e.g., Limpeza de Dentes"
              value={formData.procedureName}
              onChange={handleChange}
              className="h-11 bg-card border-border"
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
              className="h-11 bg-card border-border"
            />
            {supplyRows.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  Custo estimado pelos insumos:{" "}
                  {formatCurrency(selectedSupplyCost)}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={applySuggestedPrice}
                >
                  Usar custo sugerido
                </Button>
              </div>
            )}
          </div>

          {/* Supplies */}
          <div className="space-y-4 rounded-lg border border-border p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Insumos do procedimento
                </h2>
                <p className="text-xs text-muted-foreground">
                  Ajuste os insumos usados para calcular o custo do procedimento
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSupply}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </div>

            {supplyRows.length === 0 && (
              <p className="rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                Nenhum insumo vinculado.
              </p>
            )}

            {supplyRows.map((row, index) => {
              const selectedItem = inventoryItems.find(
                (item) => item.id === row.inventoryItemId,
              );
              const quantity = parseFloat(row.defaultQuantity) || 0;
              const unitCost = resolveUnitCost(
                row.unitCost,
                Number(selectedItem?.averageCost || 0),
              );
              const rowCost = quantity * unitCost;

              return (
                <div
                  key={`${row.templateId ?? "new"}-${index}`}
                  className="grid min-w-0 gap-3 rounded-lg bg-muted/30 p-3 lg:grid-cols-[minmax(220px,1fr)_110px_120px_120px_40px] lg:items-end"
                >
                  <div className="min-w-0 space-y-1.5">
                    <Label className="text-xs">Insumo</Label>
                    <Select
                      value={row.inventoryItemId}
                      onValueChange={(value) =>
                        handleSupplyChange(index, "inventoryItemId", value)
                      }
                    >
                      <SelectTrigger className="w-full bg-card">
                        <SelectValue placeholder="Selecione um insumo" />
                      </SelectTrigger>
                      <SelectContent>
                        {row.inventoryItemId && !selectedItem && (
                          <SelectItem value={row.inventoryItemId}>
                            Insumo vinculado ({row.inventoryItemId})
                          </SelectItem>
                        )}
                        {inventoryItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} ({item.unitType})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Quantidade</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.defaultQuantity}
                      onChange={(event) =>
                        handleSupplyChange(
                          index,
                          "defaultQuantity",
                          event.target.value,
                        )
                      }
                      className="bg-card"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Custo un.</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.unitCost}
                      onChange={(event) =>
                        handleSupplyChange(
                          index,
                          "unitCost",
                          event.target.value,
                        )
                      }
                      placeholder={
                        selectedItem
                          ? Number(selectedItem.averageCost || 0).toFixed(2)
                          : "0.00"
                      }
                      className="bg-card"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Custo</Label>
                    <div className="flex h-10 items-center rounded-md border border-border bg-card px-3 text-sm font-medium">
                      {formatCurrency(rowCost)}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveSupply(index)}
                    aria-label="Remover insumo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground font-semibold">
              Observações (Opcional)
            </Label>
            <textarea
              id="notes"
              name="notes"
              placeholder="Adicione detalhes sobre este procedimento..."
              value={formData.notes}
              onChange={handleChange}
              className="w-full border border-border rounded-lg p-3 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
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
            {isLoading
              ? "Atualizando Procedimento..."
              : "Atualizar Procedimento"}
          </Button>
        </form>
      </div>

      {/* Delete Section */}
      <div className="bg-red-50 rounded-xl border border-red-200 p-8 max-w-2xl">
        <h2 className="text-lg font-bold text-red-900 mb-2">Zona de Perigo</h2>
        <p className="text-sm text-red-700 mb-6">
          A exclusão de um procedimento não pode ser desfeita. Certifique-se de
          que deseja excluir este procedimento antes de continuar.
        </p>

        {!showDeleteConfirm ? (
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir Procedimento
          </Button>
        ) : (
          <div className="space-y-4 p-4 bg-card rounded-lg border border-red-300">
            <p className="text-sm font-medium text-red-900">
              Tem certeza de que deseja excluir "{formData.procedureName}"?
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
                className="flex-1 border-border"
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {isDeleting ? "Excluindo..." : "Excluir Procedimento"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
