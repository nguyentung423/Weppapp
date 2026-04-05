import { env } from "@/lib/config/env";
import { AlertItem, GreenhouseState } from "@/lib/types/domain";

export async function sendTelegramViaOpenClaw(text: string) {
  if (!env.openClawWebhookUrl) {
    return { delivered: false, reason: "Thiếu OPENCLAW_WEBHOOK_URL" };
  }

  try {
    const response = await fetch(env.openClawWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: "telegram",
        botToken: env.telegramBotToken,
        chatId: env.telegramChatId,
        text,
      }),
    });

    return {
      delivered: response.ok,
      reason: response.ok ? "thanh_cong" : "yeu_cau_that_bai",
    };
  } catch {
    return { delivered: false, reason: "loi_mang" };
  }
}

export async function sendProactiveCriticalAlert(
  alert: AlertItem,
  state: GreenhouseState,
) {
  const message = [
    "CẢNH BÁO NGHIÊM TRỌNG - NHÀ KÍNH THỦY CANH",
    `Tiêu đề: ${alert.title}`,
    `Mức độ: ${alert.severity}`,
    `Nguyên nhân: ${alert.explanation}`,
    `Đề xuất: ${alert.recommendation}`,
    `Nhiệt độ hiện tại: ${state.current.environment.temperature} °C`,
    `pH hiện tại: ${state.current.nutrient.ph}`,
    `EC hiện tại: ${state.current.nutrient.ec} mS/cm`,
    `Mực nước: ${state.current.nutrient.waterLevel}%`,
  ].join("\n");

  return sendTelegramViaOpenClaw(message);
}
