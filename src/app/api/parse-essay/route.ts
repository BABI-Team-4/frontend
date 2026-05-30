import { NextRequest, NextResponse } from "next/server";

export interface ParsedQuestion {
  question: string;
  answer: string;
}

export async function POST(req: NextRequest) {
  const { coverLetter } = await req.json();

  if (!coverLetter?.trim()) {
    return NextResponse.json({ success: false, error: "내용이 없습니다." }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("[parse-essay] OPENROUTER_API_KEY not set");
    return NextResponse.json({ success: false, error: "API 키가 설정되지 않았습니다." }, { status: 500 });
  }

  const prompt = `다음 자기소개서를 질문과 답변으로 나눠서 JSON 배열로 반환해주세요.
형식: [{"question": "질문 내용", "answer": "답변 내용"}, ...]
question에는 번호, 대괄호, ### 등 장식을 제거하고 순수 질문만 남겨주세요.
질문 구분이 없으면 [{"question": "자기소개서", "answer": "전체 내용"}]으로 반환해주세요.
JSON만 출력해주세요.

${coverLetter}`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-5.4-nano",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("[parse-essay] OpenRouter error:", response.status, err);
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "";

  // JSON 추출
  const match = content.match(/\[[\s\S]*\]/);
  if (!match) {
    // 파싱 실패 시 전체를 하나로
    return NextResponse.json({
      success: true,
      data: [{ question: "자기소개서", answer: coverLetter.trim() }],
    });
  }

  try {
    const parsed: ParsedQuestion[] = JSON.parse(match[0]).map(
      (item: ParsedQuestion) => ({
        ...item,
        question: item.question
          .replace(/^(?:#{1,6}\s*)?(?:\d+\.\s*|\[?\d+\]?\s*|Q\d+\.\s*)/i, "")
          .replace(/^\[(.+)\]$/, "$1")
          .trim(),
      }),
    );
    return NextResponse.json({ success: true, data: parsed });
  } catch {
    return NextResponse.json({
      success: true,
      data: [{ question: "자기소개서", answer: coverLetter.trim() }],
    });
  }
}
