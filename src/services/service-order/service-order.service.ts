import { api } from "@/lib/api";

export type ServiceOrderStatus =
  | "PENDING"
  | "WAITING_PAYMENT"
  | "PAID"
  | "CANCELED"
  | "FAILED";

export type PaymentMethod =
  | "credit_card"
  | "debit_card"
  | "pix"
  | "bank_transfer"
  | "cash"
  | "other";

export interface ServiceOrderItemPayload {
  appointmentItemId?: string;
  procedureId?: string;
  productId?: string;
  price: number;
  notes?: string;
}

export interface CreateServiceOrderPayload {
  appointmentId: string;
  patientId: string;
  items: ServiceOrderItemPayload[];
  status?: ServiceOrderStatus;
  paymentMethod?: PaymentMethod;
}

export interface ServiceOrderResponse {
  id: string;
  status: string;
  total: number;
  items: Array<{
    id: string;
    appointmentItemId: string | null;
    procedureId: string | null;
    price: number;
    notes?: string;
  }>;
  createdAt: string;
  updatedAt?: string;
}

export interface ServiceOrderListItem {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName?: string;
  status: ServiceOrderStatus;
  paymentMethod?: PaymentMethod;
  total: number;
  items: Array<{
    id: string;
    appointmentItemId: string | null;
    procedureId: string | null;
    price: number;
    notes?: string;
  }>;
  createdAt: string;
  updatedAt?: string;
}

export interface ServiceOrderListResponse {
  items: ServiceOrderListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function createServiceOrder(data: CreateServiceOrderPayload) {
  const response = await api.post<ServiceOrderResponse>("/service-orders", data);
  return response.data;
}

export async function getServiceOrdersByClinicId(
  clinicId: string,
  page: number = 1,
  pageSize: number = 100
): Promise<ServiceOrderListResponse> {
  const response = await api.get<ServiceOrderListResponse>(
    `/clinics/${clinicId}/service-orders`,
    { params: { page, pageSize } }
  );
  return response.data;
}

export async function getServiceOrdersByPatientId(
  patientId: string
): Promise<ServiceOrderListItem[]> {
  const response = await api.get<ServiceOrderListItem[]>(
    `/patients/${patientId}/service-orders`
  );
  return response.data;
}
