import { api } from "@/lib/api";

export type UnitType =
  | "UNIDADE"
  | "ML"
  | "FRASCO"
  | "SERINGA"
  | "AMPOLA"
  | "CAIXA"
  | "OUTRO";
export type InventoryCategory =
  | "PREENCHEDOR"
  | "TOXINA_BOTULINICA"
  | "ANESTESICO"
  | "BIOESTIMULADOR"
  | "FIOS"
  | "PEELING"
  | "SKINCARE"
  | "MATERIAL_DESCARTAVEL"
  | "MEDICAMENTO"
  | "OUTRO";

export const INVENTORY_CATEGORY_LABELS: Record<InventoryCategory, string> = {
  PREENCHEDOR: "Preenchedor",
  TOXINA_BOTULINICA: "Toxina botulínica",
  ANESTESICO: "Anestésico",
  BIOESTIMULADOR: "Bioestimulador",
  FIOS: "Fios",
  PEELING: "Peeling",
  SKINCARE: "Skincare",
  MATERIAL_DESCARTAVEL: "Material descartável",
  MEDICAMENTO: "Medicamento",
  OUTRO: "Outro",
};

export interface InventoryItem {
  id: string;
  clinicId: string;
  franchiseId?: string | null;
  name: string;
  category: InventoryCategory;
  unitType: UnitType;
  currentQuantity: number;
  minimumQuantity: number;
  averageCost: number;
  supplier?: string | null;
  active: boolean;
  isBelowMinimum: boolean;
  isNearMinimum: boolean;
  createdAt: string;
}

export interface CreateInventoryItemPayload {
  name: string;
  category: InventoryCategory;
  unitType: UnitType;
  minimumQuantity?: number;
  supplier?: string;
  franchiseId?: string;
}

export interface UpdateInventoryItemPayload {
  name?: string;
  category?: InventoryCategory;
  unitType?: UnitType;
  minimumQuantity?: number;
  supplier?: string;
  active?: boolean;
}

export interface CreateInventoryEntryPayload {
  inventoryItemId: string;
  quantity: number;
  unitCost: number;
  supplier?: string;
  invoiceNumber?: string;
  notes?: string;
}

export interface ConsumptionSuggestion {
  inventoryItemId: string;
  inventoryItemName: string;
  unitType: string;
  suggestedQuantity: number;
  currentStock: number;
  averageCost: number;
  isRequired: boolean;
}

export interface ConfirmConsumptionPayload {
  skip?: boolean;
  items?: Array<{ inventoryItemId: string; quantity: number }>;
  professionalId?: string;
  franchiseId?: string;
}

export interface ProcedureSupplyTemplate {
  id: string;
  procedureId: string;
  inventoryItemId: string;
  inventoryItemName?: string;
  defaultQuantity: number;
  isRequired: boolean;
}

export interface UpsertTemplatePayload {
  procedureId: string;
  inventoryItemId: string;
  defaultQuantity: number;
  isRequired?: boolean;
}

export async function listInventoryItems(
  clinicId: string,
): Promise<InventoryItem[]> {
  const response = await api.get<InventoryItem[]>(
    `/clinics/${clinicId}/inventory/items`,
  );
  return response.data;
}

export async function createInventoryItem(
  clinicId: string,
  data: CreateInventoryItemPayload,
): Promise<InventoryItem> {
  const response = await api.post<InventoryItem>(
    `/clinics/${clinicId}/inventory/items`,
    data,
  );
  return response.data;
}

export async function updateInventoryItem(
  clinicId: string,
  itemId: string,
  data: UpdateInventoryItemPayload,
): Promise<InventoryItem> {
  const response = await api.patch<InventoryItem>(
    `/clinics/${clinicId}/inventory/items/${itemId}`,
    data,
  );
  return response.data;
}

export async function createInventoryEntry(
  clinicId: string,
  data: CreateInventoryEntryPayload,
): Promise<void> {
  await api.post(`/clinics/${clinicId}/inventory/entries`, data);
}

export async function getConsumptionSuggestion(
  clinicId: string,
  serviceOrderId: string,
): Promise<ConsumptionSuggestion[]> {
  const response = await api.get<ConsumptionSuggestion[]>(
    `/clinics/${clinicId}/inventory/consumption-suggestion/${serviceOrderId}`,
  );
  return response.data;
}

export async function confirmConsumption(
  clinicId: string,
  serviceOrderId: string,
  data: ConfirmConsumptionPayload,
): Promise<{ confirmed: number; message: string }> {
  const response = await api.post(
    `/clinics/${clinicId}/inventory/consumption/${serviceOrderId}`,
    data,
  );
  return response.data;
}

export async function listSupplyTemplates(
  clinicId: string,
  procedureId: string,
): Promise<ProcedureSupplyTemplate[]> {
  const response = await api.get<ProcedureSupplyTemplate[]>(
    `/clinics/${clinicId}/inventory/templates`,
    { params: { procedureId } },
  );
  return response.data;
}

export async function upsertSupplyTemplate(
  clinicId: string,
  data: UpsertTemplatePayload,
): Promise<ProcedureSupplyTemplate> {
  const response = await api.post<ProcedureSupplyTemplate>(
    `/clinics/${clinicId}/inventory/templates`,
    data,
  );
  return response.data;
}

export async function deleteSupplyTemplate(
  clinicId: string,
  templateId: string,
): Promise<void> {
  await api.delete(`/clinics/${clinicId}/inventory/templates/${templateId}`);
}
