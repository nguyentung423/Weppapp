import { NextResponse } from "next/server";
import { askAssistant } from "@/lib/services/greenhouseService";
import { sendTelegramViaOpenClaw } from "@/lib/integrations/telegramOpenClaw";

type OpenClawTelegramPayload = {
  message?: {
    text?: string;
    chat?: {
      id?: string;
    };
  };
  text?: string;
  chatId?: string;
};

export async function POST(request: Request) {
  const body = (await request
    .json()
    .catch(() => ({}))) as OpenClawTelegramPayload;

  const incomingText = body.message?.text ?? body.text;
  if (!incomingText) {
    return NextResponse.json(
      { error: "Không tìm thấy nội dung tin nhắn đầu vào" },
      { status: 400 },
    );
  }

  const answer = askAssistant(incomingText);

  // Optional echo-back through OpenClaw if request includes chat context.
  if (body.message?.chat?.id || body.chatId) {
    await sendTelegramViaOpenClaw(answer);
  }

  return NextResponse.json({ answer });
}
