"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { GreenhouseState, ScenarioType } from "@/lib/types/domain";
import type { ApiResponse } from "@/lib/api/contracts";

type EventItem = {
  time: string;
  message: string;
  level: "warning" | "system" | "status";
};

const EVENT_LOGS_STORAGE_KEY = "hydroponic.recentEvents";
const MAX_EVENT_LOGS = 30;

const SCENARIOS: { label: string; value: ScenarioType }[] = [
  { label: "Bình thường", value: "normal" },
  { label: "Nhiệt độ cao", value: "high_temperature" },
  { label: "Lệch pH", value: "ph_drift" },
  { label: "EC thấp", value: "low_ec" },
  { label: "Mực nước giảm", value: "falling_water_level" },
  { label: "Quạt ngưng hoạt động", value: "fan_failure" },
  { label: "Bơm tắt quá lâu", value: "pump_off_too_long" },
];

const SCENARIO_LABEL_MAP: Record<ScenarioType, string> = {
  normal: "Bình thường",
  high_temperature: "Nhiệt độ cao",
  ph_drift: "Lệch pH",
  low_ec: "EC thấp",
  falling_water_level: "Mực nước giảm",
  fan_failure: "Quạt ngưng hoạt động",
  pump_off_too_long: "Bơm tắt quá lâu",
};

function appendEventLog(message: string, level: EventItem["level"] = "system") {
  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  try {
    const raw = localStorage.getItem(EVENT_LOGS_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as EventItem[]) : [];
    const next = [
      { time, message, level },
      ...(Array.isArray(parsed) ? parsed : []),
    ].slice(0, MAX_EVENT_LOGS);
    localStorage.setItem(EVENT_LOGS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore local storage errors.
  }
}

export default function CaiDatPage() {
  const router = useRouter();
  const [state, setState] = useState<GreenhouseState | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchState = async () => {
    const response = await fetch("/api/state", { cache: "no-store" });
    const payload = (await response.json()) as ApiResponse<{
      state: GreenhouseState;
    }>;

    if (!response.ok || !payload.success) {
      throw new Error("Khong the lay trang thai hien tai");
    }

    setState(payload.data.state);
  };

  useEffect(() => {
    const initialTimer = setTimeout(() => {
      void fetchState();
    }, 0);

    return () => clearTimeout(initialTimer);
  }, []);

  const onChangeScenario = async (mode: ScenarioType) => {
    setLoading(true);
    try {
      const response = await fetch("/api/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });

      const payload = (await response.json()) as ApiResponse<{
        state: GreenhouseState;
      }>;

      if (!response.ok || !payload.success) {
        throw new Error("Khong the cap nhat kich ban");
      }

      setState(payload.data.state);
      appendEventLog(
        `Hệ thống: Chuyển kịch bản [${SCENARIO_LABEL_MAP[mode]}]`,
        "system",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-[0_4px_14px_rgba(15,23,42,0.04)] sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Cài đặt hệ thống
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Quản lý kịch bản vận hành nhà kính từ trang riêng.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
          >
            Quay lại Dashboard
          </button>
        </div>
      </header>

      <section className="bento-card">
        <h2 className="font-display text-2xl text-slate-900">Kịch bản</h2>
        <p className="mt-1 text-sm text-slate-500">
          Kịch bản hiện tại:{" "}
          {state ? SCENARIO_LABEL_MAP[state.scenario.mode] : "Đang tải..."}
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {SCENARIOS.map((item) => (
            <button
              key={item.value}
              type="button"
              disabled={loading}
              onClick={() => void onChangeScenario(item.value)}
              className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                state?.scenario.mode === item.value
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 hover:border-emerald-200"
              } ${loading ? "opacity-60" : ""}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
