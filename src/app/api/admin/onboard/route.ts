import { type NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-url";

export async function POST(request: NextRequest) {
  const apiUrl = getApiUrl();
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey) {
    return NextResponse.json({ message: "Serviço não configurado." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const response = await fetch(`${apiUrl}/admin/onboard-clinic`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ message: "Erro ao conectar com o servidor." }, { status: 500 });
  }
}
