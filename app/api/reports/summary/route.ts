import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";

  // Forward cookies and authorization header to Go backend for authentication
  const cookies = request.headers.get("cookie") ?? "";
  let authHeader = request.headers.get("authorization") ?? "";

  if (!authHeader) {
    const url = new URL(request.url);
    const queryToken = url.searchParams.get("token");
    if (queryToken) {
      authHeader = `Bearer ${queryToken}`;
    }
  }

  const headers = new Headers();
  if (cookies) headers.set("cookie", cookies);
  if (authHeader) headers.set("authorization", authHeader);

  try {
    const res = await fetch(`${backendUrl}/api/reports/summary`, { headers });
    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      console.error(`Backend report request failed with status ${res.status}: ${errorText}`);
      return new NextResponse(`Failed to fetch report from backend: ${res.status} ${res.statusText}`, { status: res.status });
    }

    const data = await res.arrayBuffer();
    const contentDisposition = res.headers.get("Content-Disposition") || 'attachment; filename="FitFlow_Summary.xlsx"';

    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": contentDisposition,
      },
    });
  } catch (error: any) {
    console.error("Next.js reports summary route failed:", error);
    return new NextResponse(`Error connecting to report service: ${error.message}`, { status: 500 });
  }
}
