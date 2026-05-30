import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const target = `${BACKEND_URL}/api/v1/${path.join("/")}${req.nextUrl.search}`;

  const headers: Record<string, string> = {
    "ngrok-skip-browser-warning": "true",
  };

  const auth = req.headers.get("Authorization");
  if (auth) headers["Authorization"] = auth;

  const contentType = req.headers.get("Content-Type");
  if (contentType) headers["Content-Type"] = contentType;

  try {
    const res = await fetch(target, {
      method: req.method,
      headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined,
    });

    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
    });
  } catch (e) {
    console.error("[proxy]", target, e);
    return NextResponse.json(
      { success: false, error: "백엔드 서버에 연결할 수 없습니다." },
      { status: 502 },
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
