import { NextResponse } from "next/server";
import { askAssistant } from "@/lib/services/greenhouseService";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    question?: string;
  };

  if (!body.question) {
    return NextResponse.json(
      { error: "Bắt buộc cung cấp câu hỏi" },
      { status: 400 },
    );
  }

  return NextResponse.json({ answer: askAssistant(body.question) });
}
