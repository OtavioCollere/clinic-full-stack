import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
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
