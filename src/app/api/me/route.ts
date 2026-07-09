import { type NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-url";

export async function GET(request: NextRequest) {
  const apiUrl = getApiUrl();
  const cookieHeader = request.headers.get("cookie") || "";
  const tenant = request.headers.get("x-tenant-id") || "";

  try {
    const response = await fetch(`${apiUrl}/users/me`, {
      headers: {
        Cookie: cookieHeader,
        ...(tenant && { "X-Tenant-ID": tenant }),
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
