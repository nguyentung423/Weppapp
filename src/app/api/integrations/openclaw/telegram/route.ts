import { askAssistant } from "@/lib/services/greenhouseService";
import { sendTelegramViaOpenClaw } from "@/lib/integrations/telegramOpenClaw";
import { fail, ok, readJsonBody } from "@/lib/api/http";

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
  const body =
    (await readJsonBody<OpenClawTelegramPayload>(request)) ??
    ({} as OpenClawTelegramPayload);

  const incomingText = (body.message?.text ?? body.text)?.trim();
  if (!incomingText) {
    return fail(
      "MISSING_MESSAGE_TEXT",
      "Khong tim thay noi dung tin nhan dau vao",
      400,
    );
  }

  try {
    const answer = askAssistant(incomingText);

    // Optional echo-back through OpenClaw if request includes chat context.
    if (body.message?.chat?.id || body.chatId) {
      await sendTelegramViaOpenClaw(answer);
    }

    return ok({ answer });
  } catch {
    return fail(
      "TELEGRAM_WEBHOOK_FAILED",
      "Khong the xu ly webhook Telegram luc nay",
      500,
    );
  }
}
