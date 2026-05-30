import { NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE = 15 * 1024 * 1024;

function getExtension(name: string) {
  const parts = name.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() ?? "" : "";
}

async function extractTextFromFile(file: File) {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("파일 크기는 15MB 이하여야 합니다.");
  }

  const extension = getExtension(file.name);
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (["txt", "md"].includes(extension)) {
    return new TextDecoder("utf-8").decode(arrayBuffer);
  }

  if (extension === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (extension === "pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });

    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  throw new Error("지원하지 않는 파일 형식입니다. txt, md, docx, pdf 파일만 업로드할 수 있습니다.");
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "업로드된 파일이 없습니다." }, { status: 400 });
    }

    const text = (await extractTextFromFile(file)).trim();

    if (!text) {
      return NextResponse.json({ success: false, error: "파일에서 텍스트를 추출하지 못했습니다." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        text,
        fileName: file.name,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "파일을 처리하지 못했습니다.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
