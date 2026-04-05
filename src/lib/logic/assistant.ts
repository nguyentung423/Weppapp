import { GreenhouseState } from "@/lib/types/domain";

function normalizeText(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

function summarizeStability(state: GreenhouseState): string {
  if (state.alerts.length === 0) {
    return "Nhà kính đang ổn định. Tất cả chỉ số đang trong ngưỡng an toàn.";
  }

  const criticalCount = state.alerts.filter(
    (a) => a.severity === "critical",
  ).length;
  const highCount = state.alerts.filter((a) => a.severity === "high").length;

  return `Nhà kính chưa ổn định. Số cảnh báo đang hoạt động: ${state.alerts.length}, nghiêm trọng: ${criticalCount}, mức cao: ${highCount}.`;
}

export function answerAssistantQuestion(
  question: string,
  state: GreenhouseState,
): string {
  const q = normalizeText(question);

  if (
    q.includes("current temperature") ||
    q.includes("temperature") ||
    q.includes("nhiet do")
  ) {
    return `Nhiệt độ hiện tại là ${state.current.environment.temperature} °C.`;
  }

  if (q.includes("stable") || q.includes("on dinh")) {
    return summarizeStability(state);
  }

  if (
    q.includes("abnormal") ||
    q.includes("any abnormal") ||
    q.includes("alerts") ||
    q.includes("bat thuong") ||
    q.includes("canh bao")
  ) {
    if (state.alerts.length === 0) {
      return "Hiện tại chưa phát hiện điều kiện bất thường nào.";
    }

    return state.alerts
      .map((a) => `${a.title} (${a.severity}): ${a.explanation}`)
      .join(" ");
  }

  if (
    (q.includes("why") && q.includes("ph")) ||
    (q.includes("vi sao") && q.includes("ph"))
  ) {
    const phAlert = state.alerts.find((a) => a.code === "NUTRIENT_PH_DRIFT");
    if (!phAlert) {
      return "pH hiện đang trong ngưỡng chấp nhận và không bị cảnh báo.";
    }
    return `${phAlert.explanation} Đề xuất: ${phAlert.recommendation}`;
  }

  if (
    q.includes("what should i do") ||
    q.includes("what should i do now") ||
    q.includes("nen lam gi")
  ) {
    if (state.alerts.length === 0) {
      return "Chưa cần can thiệp ngay. Hãy tiếp tục theo dõi định kỳ.";
    }

    return state.alerts
      .slice(0, 2)
      .map((a) => `${a.title}: ${a.recommendation}`)
      .join(" ");
  }

  return "Tôi có thể trả lời về nhiệt độ, độ ổn định, các bất thường, lý do pH bị cảnh báo và hành động tiếp theo.";
}
