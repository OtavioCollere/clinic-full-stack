const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export interface InviteTokenData {
  id: string;
  token: string;
  inviteUrl: string;
  status: "PENDING" | "USED" | "EXPIRED" | "REVOKED";
  expiresAt: string;
  createdAt: string;
  usedAt?: string;
}

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, { credentials: "include", ...init });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export async function generateInvite(
  expiresInDays: number,
): Promise<{ success: boolean; data: InviteTokenData }> {
  return adminFetch("/admin/invite-tokens", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ expiresInDays }),
  });
}

export async function listInvites(): Promise<{
  success: boolean;
  data: InviteTokenData[];
}> {
  return adminFetch("/admin/invite-tokens");
}

export async function revokeInvite(id: string): Promise<void> {
  await adminFetch(`/admin/invite-tokens/${id}/revoke`, { method: "DELETE" });
}

export async function validateToken(
  token: string,
): Promise<{ valid: boolean; expiresAt: string }> {
  const res = await fetch(`${API}/onboard/${token}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error("invalid"), {
      status: res.status,
      errorCode: body?.errorCode ?? "NOT_FOUND",
    });
  }
  const json = await res.json();
  return json.data;
}

export async function registerViaToken(
  token: string,
  data: { name: string; email: string; cpf: string; password: string },
): Promise<{ userId: string }> {
  const res = await fetch(`${API}/onboard/${token}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error("register_failed"), {
      status: res.status,
      errorCode: body?.errorCode,
    });
  }
  const json = await res.json();
  return json.data;
}
