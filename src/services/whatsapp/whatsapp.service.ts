import { api } from "@/lib/api";

export type WhatsappStatus = "DISCONNECTED" | "PENDING_QR" | "CONNECTED";

export interface WhatsappStatusResponse {
  status: WhatsappStatus;
  phoneNumber?: string;
}

export interface WhatsappQrResponse {
  qrCode: string; // base64 da imagem do QR
}

export interface WhatsappConfig {
  notifyOnCreate: boolean;
  notifyReminder: boolean;
  reminderHoursBefore: number;
  notifyPostConsult: boolean;
  notifyOnCancel: boolean;
}

export async function getWhatsappStatus(
  franchiseId: string
): Promise<WhatsappStatusResponse> {
  const res = await api.get(`/franchises/${franchiseId}/whatsapp/status`);
  return res.data;
}

export async function connectWhatsapp(
  franchiseId: string
): Promise<WhatsappQrResponse> {
  const res = await api.post(`/franchises/${franchiseId}/whatsapp/connect`);
  return res.data;
}

export async function disconnectWhatsapp(franchiseId: string): Promise<void> {
  await api.delete(`/franchises/${franchiseId}/whatsapp/disconnect`);
}

export async function getWhatsappConfig(
  franchiseId: string
): Promise<WhatsappConfig> {
  const res = await api.get(`/franchises/${franchiseId}/whatsapp/config`);
  return res.data;
}

export async function saveWhatsappConfig(
  franchiseId: string,
  config: Partial<WhatsappConfig>
): Promise<void> {
  await api.patch(`/franchises/${franchiseId}/whatsapp/config`, config);
}
