import { AlertItem, Reading, Severity } from "@/lib/types/domain";

function buildAlert(
  code: string,
  title: string,
  severity: Severity,
  explanation: string,
  recommendation: string,
  timestamp: string,
): AlertItem {
  return {
    id: crypto.randomUUID(),
    code,
    title,
    severity,
    explanation,
    recommendation,
    timestamp,
  };
}

export function evaluateReading(reading: Reading): AlertItem[] {
  const alerts: AlertItem[] = [];

  if (reading.environment.temperature > 30) {
    const severity: Severity =
      reading.environment.temperature > 34 ? "critical" : "high";
    alerts.push(
      buildAlert(
        "ENV_TEMP_HIGH",
        "Nhiệt độ vượt ngưỡng khỏe mạnh",
        severity,
        `Nhiệt độ hiện tại là ${reading.environment.temperature} °C, có thể gây stress cho cây thủy canh và giảm khả năng hấp thu dinh dưỡng.`,
        "Tăng thông gió, kiểm tra trạng thái quạt và giảm nguồn nhiệt gần nhà kính.",
        reading.timestamp,
      ),
    );
  }

  if (reading.nutrient.ph < 5.5 || reading.nutrient.ph > 6.5) {
    alerts.push(
      buildAlert(
        "NUTRIENT_PH_DRIFT",
        "Phát hiện pH bị lệch",
        reading.nutrient.ph > 7 || reading.nutrient.ph < 5.2
          ? "high"
          : "medium",
        `pH hiện tại là ${reading.nutrient.ph}, nằm ngoài ngưỡng lý tưởng 5.5-6.5 nên cây có thể khó hấp thu dinh dưỡng.`,
        "Canh chỉnh pH Up/Down từng bước nhỏ, sau đó đo lại đến khi pH về 5.8-6.3.",
        reading.timestamp,
      ),
    );
  }

  if (reading.nutrient.ec < 1.4) {
    alerts.push(
      buildAlert(
        "NUTRIENT_EC_LOW",
        "EC đang quá thấp",
        reading.nutrient.ec < 1.1 ? "high" : "medium",
        `EC hiện tại là ${reading.nutrient.ec} mS/cm. Dung dịch dinh dưỡng có thể đang quá loãng cho mục tiêu tăng trưởng tối ưu.`,
        "Tăng nồng độ dinh dưỡng theo từng bước nhỏ và đo lại EC sau khi pha.",
        reading.timestamp,
      ),
    );
  }

  if (reading.nutrient.waterLevel < 30) {
    alerts.push(
      buildAlert(
        "WATER_LEVEL_LOW",
        "Mực nước bể chứa đang thấp",
        reading.nutrient.waterLevel < 15 ? "critical" : "high",
        `Mực nước hiện tại là ${reading.nutrient.waterLevel}%, có nguy cơ gây hụt khí cho bơm và làm mất ổn định hệ thống cấp dinh dưỡng.`,
        "Bổ sung nước cho bể và kiểm tra rò rỉ hoặc mức tiêu thụ bất thường.",
        reading.timestamp,
      ),
    );
  }

  if (!reading.device.fanStatus) {
    alerts.push(
      buildAlert(
        "DEVICE_FAN_OFF",
        "Quạt thông gió đang tắt",
        reading.environment.temperature > 30 ? "critical" : "high",
        "Quạt đang tắt nên khả năng làm mát và trao đổi không khí trong nhà kính bị giảm.",
        "Kiểm tra relay nguồn, phần cứng quạt và tín hiệu điều khiển ngay.",
        reading.timestamp,
      ),
    );
  }

  if (!reading.device.pumpStatus && reading.device.operatingTime > 25) {
    alerts.push(
      buildAlert(
        "DEVICE_PUMP_OFF_TOO_LONG",
        "Bơm đã tắt quá lâu",
        "critical",
        "Bơm đang tắt trong khi thời gian vận hành tiếp tục tăng, rễ cây có thể bị bỏ lỡ chu kỳ tưới.",
        "Khởi động lại bơm, kiểm tra tắc nghẽn và xác minh lịch điều khiển.",
        reading.timestamp,
      ),
    );
  }

  return alerts;
}

export function isStable(alerts: AlertItem[]): boolean {
  return alerts.every((alert) => alert.severity === "low");
}
