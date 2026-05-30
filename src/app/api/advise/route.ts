import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const token = req.headers.get("Authorization");
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/advise`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("[advise proxy]", e);
    return NextResponse.json({ success: false, error: "백엔드 서버에 연결할 수 없습니다." }, { status: 502 });
  }
}
