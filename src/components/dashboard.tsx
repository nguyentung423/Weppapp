"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GreenhouseState, ScenarioType } from "@/lib/types/domain";
import type { ApiResponse } from "@/lib/api/contracts";
import type {
  DeviceControlPatch,
  DeviceControlState,
  PhAdjustmentMode,
} from "@/lib/types/control";

type HistoryWindow = "30m" | "2h";

type HistoryPoint = {
  timestamp: string;
  temperature: number;
  humidity: number;
  co2: number;
  ph: number;
  ec: number;
  waterLevel: number;
};

type ChartMetricKey =
  | "temperature"
  | "humidity"
  | "co2"
  | "ec"
  | "ph"
  | "waterLevel";

type ChartMetricConfig = {
  key: ChartMetricKey;
  label: string;
  unit: string;
  color: string;
  normalMin: number;
  normalMax: number;
  getValue: (point: HistoryPoint) => number;
};

type EventItem = {
  time: string;
  message: string;
  level: "warning" | "system" | "status";
};

type MetricAlertState = {
  isOutOfRange: boolean;
  direction: "high" | "low" | null;
  message: string;
};

const DASHBOARD_POLL_INTERVAL_MS = 60_000;
const EVENT_LOGS_STORAGE_KEY = "hydroponic.recentEvents.v2";
const MAX_EVENT_LOGS = 30;
const TELEGRAM_AGENT_URL = "https://t.me/tungtungtungsahuaa_bot";

const DEFAULT_DEVICE_CONTROLS: DeviceControlState = {
  waterPumpEnabled: true,
  nutrientPumpEnabled: true,
  growLightsEnabled: true,
  mistingEnabled: true,
  fanEnabled: true,
  fanSpeed: 50,
  co2PumpEnabled: true,
  curtainPercent: 60,
  updatedAt: new Date().toISOString(),
};

const SCENARIO_LABEL_MAP: Record<ScenarioType, string> = {
  normal: "Bình thường",
  high_temperature: "Nhiệt độ cao",
  ph_drift: "Lệch pH",
  low_ec: "EC thấp",
  falling_water_level: "Mực nước giảm",
  fan_failure: "Quạt ngưng hoạt động",
  pump_off_too_long: "Bơm tắt quá lâu",
};

const CHART_METRICS: ChartMetricConfig[] = [
  {
    key: "temperature",
    label: "Nhiệt độ",
    unit: "°C",
    color: "#62ff9a",
    normalMin: 23,
    normalMax: 27,
    getValue: (point) => point.temperature,
  },
  {
    key: "humidity",
    label: "Độ ẩm",
    unit: "%",
    color: "#4dffb2",
    normalMin: 55,
    normalMax: 70,
    getValue: (point) => point.humidity,
  },
  {
    key: "co2",
    label: "CO2",
    unit: "ppm",
    color: "#86ff63",
    normalMin: 700,
    normalMax: 1100,
    getValue: (point) => point.co2,
  },
  {
    key: "ec",
    label: "EC",
    unit: "mS/cm",
    color: "#32ff90",
    normalMin: 1.6,
    normalMax: 2.2,
    getValue: (point) => point.ec,
  },
  {
    key: "ph",
    label: "pH",
    unit: "",
    color: "#88ffcf",
    normalMin: 5.8,
    normalMax: 6.3,
    getValue: (point) => point.ph,
  },
  {
    key: "waterLevel",
    label: "Mực nước",
    unit: "%",
    color: "#a5ff6c",
    normalMin: 45,
    normalMax: 90,
    getValue: (point) => point.waterLevel,
  },
];

function formatShortTime(iso: string) {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.max(1, Math.floor(diff / 1000));
  if (seconds < 60) return `${seconds}s\u00A0trước`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m\u00A0trước`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h\u00A0trước`;
}

function toHistoryPoint(reading: GreenhouseState["current"]): HistoryPoint {
  return {
    timestamp: reading.timestamp,
    temperature: reading.environment.temperature,
    humidity: reading.environment.humidity,
    co2: reading.environment.co2,
    ph: reading.nutrient.ph,
    ec: reading.nutrient.ec,
    waterLevel: reading.nutrient.waterLevel,
  };
}

function mergeRealtimeHistory(
  existing: HistoryPoint[],
  state: GreenhouseState,
  window: HistoryWindow,
): HistoryPoint[] {
  const latest = toHistoryPoint(state.current);
  const foundIndex = existing.findIndex(
    (point) => point.timestamp === latest.timestamp,
  );

  const merged =
    foundIndex >= 0
      ? existing.map((point, index) => (index === foundIndex ? latest : point))
      : [...existing, latest];

  const sinceMs = Date.now() - (window === "30m" ? 30 : 120) * 60_000;
  return merged
    .filter((point) => new Date(point.timestamp).getTime() >= sinceMs)
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
}

function buildMetricAlertMap(
  reading: GreenhouseState["current"],
): Record<ChartMetricKey, MetricAlertState> {
  const currentPoint = toHistoryPoint(reading);

  return CHART_METRICS.reduce(
    (acc, metric) => {
      const currentValue = metric.getValue(currentPoint);

      if (currentValue < metric.normalMin) {
        acc[metric.key] = {
          isOutOfRange: true,
          direction: "low",
          message: `Thấp hơn ngưỡng tốt (${metric.normalMin}${metric.unit ? ` ${metric.unit}` : ""})`,
        };
        return acc;
      }

      if (currentValue > metric.normalMax) {
        acc[metric.key] = {
          isOutOfRange: true,
          direction: "high",
          message: `Cao hơn ngưỡng tốt (${metric.normalMax}${metric.unit ? ` ${metric.unit}` : ""})`,
        };
        return acc;
      }

      acc[metric.key] = {
        isOutOfRange: false,
        direction: null,
        message: "",
      };
      return acc;
    },
    {} as Record<ChartMetricKey, MetricAlertState>,
  );
}

export default function Dashboard() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<GreenhouseState | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [historyWindow, setHistoryWindow] = useState<HistoryWindow>("30m");
  const [selectedMetric, setSelectedMetric] =
    useState<ChartMetricKey>("temperature");
  const [now, setNow] = useState<Date | null>(null);
  const [deviceControls, setDeviceControls] = useState<DeviceControlState>(
    DEFAULT_DEVICE_CONTROLS,
  );
  const [phDrops, setPhDrops] = useState(3);
  const [eventLogs, setEventLogs] = useState<EventItem[]>([]);
  const topRef = useRef<HTMLDivElement | null>(null);
  const logsRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const pushEvent = (message: string, level: EventItem["level"] = "system") => {
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    setEventLogs((prev) =>
      [{ time, message, level }, ...prev].slice(0, MAX_EVENT_LOGS),
    );
  };

  const fetchState = useCallback(async () => {
    const response = await fetch("/api/state", { cache: "no-store" });
    const payload = (await response.json()) as ApiResponse<{
      state: GreenhouseState;
    }>;

    if (!response.ok || !payload.success) {
      throw new Error("Khong the lay du lieu trang thai");
    }

    setState(payload.data.state);
    setHistory((previous) =>
      mergeRealtimeHistory(previous, payload.data.state, historyWindow),
    );
  }, [historyWindow]);

  const fetchHistory = useCallback(async (window: HistoryWindow) => {
    const response = await fetch(`/api/history?window=${window}`, {
      cache: "no-store",
    });

    const payload = (await response.json()) as ApiResponse<{
      history: HistoryPoint[];
    }>;

    if (!response.ok || !payload.success) {
      throw new Error("Khong the lay du lieu lich su");
    }

    setHistory(payload.data.history ?? []);
  }, []);

  const fetchDeviceControls = useCallback(async () => {
    const response = await fetch("/api/devices/control", { cache: "no-store" });
    const payload = (await response.json()) as ApiResponse<{
      controls: DeviceControlState;
    }>;

    if (!response.ok || !payload.success) {
      throw new Error("Khong the lay trang thai dieu khien");
    }

    setDeviceControls(payload.data.controls);
  }, []);

  const applyDeviceControlsPatch = async (controls: DeviceControlPatch) => {
    const response = await fetch("/api/devices/control", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "dashboard", controls }),
    });

    const payload = (await response.json()) as ApiResponse<{
      controls: DeviceControlState;
    }>;

    if (!response.ok || !payload.success) {
      throw new Error("Khong the cap nhat dieu khien thiet bi");
    }

    setDeviceControls(payload.data.controls);
  };

  const applyPhBalance = async (mode: PhAdjustmentMode, drops: number) => {
    const response = await fetch("/api/devices/ph-balance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "dashboard",
        mode,
        drops,
      }),
    });

    const payload = (await response.json()) as ApiResponse<{
      state: GreenhouseState;
      adjustment: {
        mode: PhAdjustmentMode;
        drops: number;
        previousPh: number;
        nextPh: number;
      };
    }>;

    if (!response.ok || !payload.success) {
      throw new Error("Khong the can bang pH");
    }

    setState(payload.data.state);
    setHistory((previous) =>
      mergeRealtimeHistory(previous, payload.data.state, historyWindow),
    );
    return payload.data.adjustment;
  };

  useEffect(() => {
    const initialTimer = setTimeout(() => {
      void fetchState();
      void fetchHistory(historyWindow);
      void fetchDeviceControls();
    }, 0);

    const timer = setInterval(() => {
      void fetchState();
      void fetchHistory(historyWindow);
      void fetchDeviceControls();
    }, DASHBOARD_POLL_INTERVAL_MS);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(timer);
    };
  }, [fetchDeviceControls, fetchHistory, fetchState, historyWindow]);

  useEffect(() => {
    const initialTick = setTimeout(() => setNow(new Date()), 0);
    const clockTimer = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearTimeout(initialTick);
      clearInterval(clockTimer);
    };
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(EVENT_LOGS_STORAGE_KEY);
      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored) as EventItem[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setTimeout(() => {
          setEventLogs(parsed.slice(0, MAX_EVENT_LOGS));
        }, 0);
      }
    } catch {
      // Ignore storage read errors (private mode/corrupted data).
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(EVENT_LOGS_STORAGE_KEY, JSON.stringify(eventLogs));
    } catch {
      // Ignore storage write errors (private mode/full storage).
    }
  }, [eventLogs]);

  const historyCaption = historyWindow === "30m" ? "30 phút" : "2 giờ";
  const lastUpdated = state
    ? formatRelativeTime(state.current.timestamp)
    : "--";
  const selectedMetricConfig =
    CHART_METRICS.find((metric) => metric.key === selectedMetric) ??
    CHART_METRICS[0];
  const hasTelegramAgentLink = TELEGRAM_AGENT_URL.trim().length > 0;

  const navItems = [
    { label: "Dashboard", href: "/" },
    { label: "Hướng dẫn trồng", href: "/huong-dan-thuy-canh" },
    { label: "Nhật ký", href: "/nhat-ky" },
    { label: "Cài đặt", href: "/cai-dat" },
  ] as const;

  if (!mounted) {
    return (
      <main className="dashboard-shell mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-6 py-16">
        <p className="text-xl text-emerald-200 drop-shadow-[0_0_10px_rgba(98,255,154,0.45)]">
          Đang tải bảng điều khiển nhà kính...
        </p>
      </main>
    );
  }

  if (!state) {
    return (
      <main className="dashboard-shell mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-6 py-16">
        <p className="text-xl text-emerald-200">
          Đang tải bảng điều khiển nhà kính...
        </p>
      </main>
    );
  }

  const metricAlertMap = buildMetricAlertMap(state.current);
  const alerts = state.alerts ?? [];
  const hasOutOfRangeMetric = Object.values(metricAlertMap).some(
    (metricAlert) => metricAlert.isOutOfRange,
  );
  const statusText =
    alerts.length === 0 && !hasOutOfRangeMetric ? "Ổn định" : "Cần chú ý";
  const statusTone = alerts.some((a) => a.severity === "critical")
    ? "bg-rose-900/35 text-rose-300"
    : alerts.length > 0 || hasOutOfRangeMetric
      ? "bg-amber-900/35 text-amber-300"
      : "bg-emerald-900/35 text-emerald-300";

  return (
    <main className="dashboard-shell mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="rounded-2xl border border-slate-700/80 bg-[#121a2b] px-4 py-4 sm:px-6 sm:py-5">
        <div
          ref={topRef}
          className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-300/85">
              Control Console
            </p>
            <h1 className="mt-1 truncate font-display text-xl font-semibold text-slate-100 sm:text-2xl">
              Claude Team{" "}
              <span className="text-emerald-300">· IoT Agentic</span>
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="rounded-full border border-slate-600/90 bg-slate-800 px-2.5 py-1 font-medium text-slate-200">
                Kịch bản: {SCENARIO_LABEL_MAP[state.scenario.mode]}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 font-medium ${statusTone}`}
              >
                Trạng thái: {statusText}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <p
              className="text-xs text-slate-300 sm:text-sm"
              suppressHydrationWarning
            >
              {now
                ? new Intl.DateTimeFormat("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  }).format(now)
                : "--/--/---- --:--:--"}
            </p>

            <nav
              className="flex flex-wrap items-center gap-1 text-sm"
              aria-label="Điều hướng chính"
            >
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={
                      isActive
                        ? "rounded-full border border-emerald-500/80 bg-slate-900 px-3 py-1.5 font-medium text-emerald-300"
                        : "rounded-full border border-transparent px-3 py-1.5 text-slate-300 hover:border-slate-600 hover:bg-slate-800 hover:text-slate-100"
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <section className="dashboard-bento">
        <MetricBentoCard
          title="Nhiệt độ"
          value={`${state.current.environment.temperature} °C`}
          highlight="text-emerald-600"
          updatedAt={lastUpdated}
          alert={metricAlertMap.temperature}
          online
          signalStrength={4}
          active={selectedMetric === "temperature"}
          onClick={() => setSelectedMetric("temperature")}
        />
        <MetricBentoCard
          title="Độ ẩm"
          value={`${state.current.environment.humidity} %`}
          highlight="text-emerald-600"
          updatedAt={lastUpdated}
          alert={metricAlertMap.humidity}
          online
          signalStrength={4}
          active={selectedMetric === "humidity"}
          onClick={() => setSelectedMetric("humidity")}
        />
        <MetricBentoCard
          title="CO2"
          value={`${state.current.environment.co2} ppm`}
          highlight="text-emerald-600"
          updatedAt={lastUpdated}
          alert={metricAlertMap.co2}
          online
          signalStrength={3}
          active={selectedMetric === "co2"}
          onClick={() => setSelectedMetric("co2")}
        />
        <MetricBentoCard
          title="EC"
          value={`${state.current.nutrient.ec} mS/cm`}
          highlight="text-emerald-600"
          updatedAt={lastUpdated}
          alert={metricAlertMap.ec}
          online
          signalStrength={4}
          active={selectedMetric === "ec"}
          onClick={() => setSelectedMetric("ec")}
        />
        <MetricBentoCard
          title="pH"
          value={`${state.current.nutrient.ph}`}
          highlight="text-emerald-600"
          updatedAt={lastUpdated}
          alert={metricAlertMap.ph}
          online
          signalStrength={3}
          active={selectedMetric === "ph"}
          onClick={() => setSelectedMetric("ph")}
        />
        <MetricBentoCard
          title="Mực nước"
          value={`${state.current.nutrient.waterLevel} %`}
          highlight="text-emerald-600"
          updatedAt={lastUpdated}
          alert={metricAlertMap.waterLevel}
          online
          signalStrength={3}
          active={selectedMetric === "waterLevel"}
          onClick={() => setSelectedMetric("waterLevel")}
        />

        <article className="bento-card bento-live lg:col-span-4 xl:col-span-8 xl:row-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-emerald-100">
              Lịch sử {selectedMetricConfig.label}
            </h2>
            <div className="flex gap-2">
              {(
                [
                  { label: "30 phút", value: "30m" },
                  { label: "2 giờ", value: "2h" },
                ] as const
              ).map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setHistoryWindow(item.value)}
                  className={`rounded-full border px-3 py-1 text-sm transition ${
                    historyWindow === item.value
                      ? "border-emerald-400 bg-emerald-500/20 text-emerald-100"
                      : "border-emerald-400/20 text-emerald-200/80 hover:border-emerald-400/50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <p className="card-subtle mt-2 text-sm text-emerald-100/70">
            Theo dõi xu hướng {selectedMetricConfig.label.toLowerCase()} trong{" "}
            {historyCaption} gần nhất.
          </p>
          <MetricHistoryChart metric={selectedMetricConfig} data={history} />
        </article>

        <article className="bento-card bento-live lg:col-span-2 xl:col-span-4 xl:row-span-2">
          <h2 className="font-display text-2xl text-emerald-100">
            Cường độ ánh sáng
          </h2>
          <p className="card-subtle mt-1 text-sm text-emerald-100/70">
            Đơn vị: umol/m2/s
          </p>
          <div className="mt-5">
            <SemiGauge
              value={state.current.environment.lightIntensity}
              min={0}
              max={1200}
            />
          </div>
          <p className="card-subtle mt-3 text-sm text-emerald-100/70">
            Cập nhật: {lastUpdated}
          </p>
        </article>

        <div className="grid items-start gap-4 lg:col-span-6 lg:grid-cols-3 xl:col-span-12">
          <article className="bento-card lg:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl text-emerald-100">
                Điều khiển thiết bị
              </h2>
            </div>

            <div className="mt-4">
              <div className="grid gap-3 md:grid-cols-3">
                <ControlToggle
                  label="Bơm nước"
                  enabled={deviceControls.waterPumpEnabled}
                  onToggle={() => {
                    const nextValue = !deviceControls.waterPumpEnabled;
                    void applyDeviceControlsPatch({
                      waterPumpEnabled: nextValue,
                    });
                    pushEvent(
                      `Hệ thống: Bơm nước [${nextValue ? "BẬT" : "TẮT"}]`,
                      "system",
                    );
                  }}
                />
                <ControlToggle
                  label="Bơm dinh dưỡng"
                  enabled={deviceControls.nutrientPumpEnabled}
                  onToggle={() => {
                    const nextValue = !deviceControls.nutrientPumpEnabled;
                    void applyDeviceControlsPatch({
                      nutrientPumpEnabled: nextValue,
                    });
                    pushEvent(
                      `Hệ thống: Bơm dinh dưỡng [${nextValue ? "BẬT" : "TẮT"}]`,
                      "system",
                    );
                  }}
                />
                <ControlToggle
                  label="Đèn quang hợp"
                  enabled={deviceControls.growLightsEnabled}
                  onToggle={() => {
                    const nextValue = !deviceControls.growLightsEnabled;
                    void applyDeviceControlsPatch({
                      growLightsEnabled: nextValue,
                    });
                    pushEvent(
                      `Hệ thống: Đèn quang hợp [${nextValue ? "BẬT" : "TẮT"}]`,
                      "system",
                    );
                  }}
                />
                <ControlToggle
                  label="Phun sương"
                  enabled={deviceControls.mistingEnabled}
                  onToggle={() => {
                    const nextValue = !deviceControls.mistingEnabled;
                    void applyDeviceControlsPatch({
                      mistingEnabled: nextValue,
                    });
                    pushEvent(
                      `Hệ thống: Phun sương [${nextValue ? "BẬT" : "TẮT"}]`,
                      "system",
                    );
                  }}
                />
                <ControlToggle
                  label="Quạt thông gió"
                  enabled={deviceControls.fanEnabled}
                  onToggle={() => {
                    const nextValue = !deviceControls.fanEnabled;
                    void applyDeviceControlsPatch({ fanEnabled: nextValue });
                    pushEvent(
                      `Hệ thống: Quạt thông gió [${nextValue ? "BẬT" : "TẮT"}]`,
                      "system",
                    );
                  }}
                />
                <ControlToggle
                  label="Bơm CO2"
                  enabled={deviceControls.co2PumpEnabled}
                  onToggle={() => {
                    const nextValue = !deviceControls.co2PumpEnabled;
                    void applyDeviceControlsPatch({
                      co2PumpEnabled: nextValue,
                    });
                    pushEvent(
                      `Hệ thống: Bơm CO2 [${nextValue ? "BẬT" : "TẮT"}]`,
                      "system",
                    );
                  }}
                />
              </div>

              <div className="mt-5 rounded-xl border border-emerald-500/30 bg-[#0b1917]/70 p-3">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <p className="font-medium text-emerald-100/90">
                    Công suất quạt gió
                  </p>
                  <p className="font-semibold text-emerald-300">
                    {deviceControls.fanSpeed}%
                  </p>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={deviceControls.fanSpeed}
                  onChange={(event) => {
                    const nextSpeed = Number(event.target.value);
                    setDeviceControls((prev) => ({
                      ...prev,
                      fanSpeed: nextSpeed,
                    }));
                  }}
                  onMouseUp={() =>
                    void (async () => {
                      await applyDeviceControlsPatch({
                        fanSpeed: deviceControls.fanSpeed,
                      });
                      pushEvent(
                        `Hệ thống: Công suất quạt gió [${deviceControls.fanSpeed}%]`,
                        "status",
                      );
                    })()
                  }
                  onTouchEnd={() =>
                    void (async () => {
                      await applyDeviceControlsPatch({
                        fanSpeed: deviceControls.fanSpeed,
                      });
                      pushEvent(
                        `Hệ thống: Công suất quạt gió [${deviceControls.fanSpeed}%]`,
                        "status",
                      );
                    })()
                  }
                  className="fan-slider w-full"
                />
              </div>

              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-[#0b1917]/70 p-3">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <p className="font-medium text-emerald-100/90">Độ mở rèm</p>
                  <p className="font-semibold text-emerald-300">
                    {deviceControls.curtainPercent}%
                  </p>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={deviceControls.curtainPercent}
                  onChange={(event) => {
                    const nextValue = Number(event.target.value);
                    setDeviceControls((prev) => ({
                      ...prev,
                      curtainPercent: nextValue,
                    }));
                  }}
                  onMouseUp={() =>
                    void (async () => {
                      await applyDeviceControlsPatch({
                        curtainPercent: deviceControls.curtainPercent,
                      });
                      pushEvent(
                        `Hệ thống: Độ mở rèm [${deviceControls.curtainPercent}%]`,
                        "status",
                      );
                    })()
                  }
                  onTouchEnd={() =>
                    void (async () => {
                      await applyDeviceControlsPatch({
                        curtainPercent: deviceControls.curtainPercent,
                      });
                      pushEvent(
                        `Hệ thống: Độ mở rèm [${deviceControls.curtainPercent}%]`,
                        "status",
                      );
                    })()
                  }
                  className="fan-slider w-full"
                />
              </div>

              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-[#0b1917]/70 p-3">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <p className="font-medium text-emerald-100/90">
                    Cân bằng pH bằng dung dịch
                  </p>
                  <p className="font-semibold text-emerald-300">
                    {phDrops} giọt
                  </p>
                </div>
                <p className="card-subtle mb-2 text-xs text-emerald-100/65">
                  pH cao: dùng dung dịch giảm pH (pH Down/acid). pH thấp: dùng
                  dung dịch tăng pH (pH Up/kiềm).
                </p>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={phDrops}
                  onChange={(event) => setPhDrops(Number(event.target.value))}
                  className="fan-slider w-full"
                />
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() =>
                      void (async () => {
                        const adjustment = await applyPhBalance(
                          "ph_high",
                          phDrops,
                        );
                        pushEvent(
                          `Cân pH: pH cao, châm pH Down ${adjustment.drops} giọt (pH ${adjustment.previousPh} -> ${adjustment.nextPh})`,
                          "status",
                        );
                      })()
                    }
                    className="rounded-xl border border-emerald-400/50 bg-emerald-500/15 px-3 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/25"
                  >
                    pH cao (nhỏ pH Down)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void (async () => {
                        const adjustment = await applyPhBalance(
                          "ph_low",
                          phDrops,
                        );
                        pushEvent(
                          `Cân pH: pH thấp, châm pH Up ${adjustment.drops} giọt (pH ${adjustment.previousPh} -> ${adjustment.nextPh})`,
                          "status",
                        );
                      })()
                    }
                    className="rounded-xl border border-teal-400/45 bg-teal-500/12 px-3 py-2 text-sm font-medium text-teal-200 transition hover:bg-teal-500/22"
                  >
                    pH thấp (nhỏ pH Up)
                  </button>
                </div>
              </div>
            </div>
          </article>

          <aside className="flex h-full flex-col gap-4 lg:col-span-1">
            <article
              ref={logsRef}
              className="bento-card console-card flex min-h-0 flex-col"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl text-emerald-100">
                  Sự kiện gần đây
                </h2>
                <button
                  type="button"
                  onClick={() => router.push("/nhat-ky")}
                  className="text-xs font-medium text-emerald-300 transition hover:text-emerald-200"
                >
                  Xem tất cả
                </button>
              </div>
              <ul className="logs-scroll mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
                {eventLogs.slice(0, 8).map((event, index) => (
                  <li
                    key={`${event.time}-${event.message}-${index}`}
                    className="rounded-xl border border-emerald-500/25 bg-[#0a1513]/70 px-3 py-2"
                  >
                    <p className="card-subtle text-xs text-emerald-100/55">
                      [{event.time}]
                    </p>
                    <p
                      className={`mt-0.5 text-sm ${
                        event.level === "warning"
                          ? "text-amber-300"
                          : event.level === "status"
                            ? "text-emerald-300"
                            : "text-emerald-100/85"
                      }`}
                    >
                      {event.message}
                    </p>
                  </li>
                ))}
                {eventLogs.length === 0 && (
                  <li className="rounded-xl border border-emerald-500/25 bg-[#0a1513]/70 px-3 py-2 text-sm text-emerald-100/60">
                    Chưa có sự kiện nào gần đây.
                  </li>
                )}
              </ul>
            </article>

            <article className="bento-card console-card ai-agent-card">
              <div className="flex items-center justify-between gap-2">
                <span className="ai-agent-kicker">Feature nổi bật</span>
                <span className="ai-agent-channel">Telegram</span>
              </div>

              <h2 className="font-display ai-agent-headline mt-2 text-xl leading-tight">
                AI AGENT LIVE
              </h2>

              <p className="font-display ai-agent-subhead mt-1 text-sm">
                Chạm để mở hội thoại, nhận chỉ dẫn hành động ngay tức thì.
              </p>

              <div className="mt-2 flex items-center gap-2 text-xs text-emerald-100/80">
                <span className="ai-agent-beacon" aria-hidden="true" />
                <span className="font-medium">
                  AI Agent đang trực tuyến 24/7
                </span>
              </div>

              <button
                type="button"
                disabled={!hasTelegramAgentLink}
                onClick={() => {
                  if (!hasTelegramAgentLink) {
                    return;
                  }

                  window.open(
                    TELEGRAM_AGENT_URL,
                    "_blank",
                    "noopener,noreferrer",
                  );
                }}
                className="ai-agent-cta mt-4 rounded-xl px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed"
              >
                {hasTelegramAgentLink
                  ? "Mở Telegram AI Agent"
                  : "Chờ cập nhật link Telegram"}
              </button>
            </article>
          </aside>
        </div>
      </section>
    </main>
  );
}

function MetricBentoCard({
  title,
  value,
  highlight,
  updatedAt,
  alert,
  online,
  signalStrength,
  active,
  onClick,
}: {
  title: string;
  value: string;
  highlight?: string;
  updatedAt: string;
  alert: MetricAlertState;
  online: boolean;
  signalStrength: 1 | 2 | 3 | 4;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`metric-card bento-card bento-live relative h-35 text-left lg:col-span-2 xl:col-span-2 ${
        alert.isOutOfRange
          ? "metric-card-warning"
          : active
            ? "metric-card-active"
            : "metric-card-normal"
      }`}
    >
      {alert.isOutOfRange && (
        <span
          className="absolute right-2 top-2 z-10 inline-flex h-5 w-5 items-center justify-center rounded-full border border-amber-200 bg-amber-300 text-[11px] font-bold text-slate-900 shadow-[0_0_0_2px_rgba(22,29,43,0.9)]"
          aria-label={`Canh bao nhe: ${alert.message}`}
          title={alert.message}
        >
          !
        </span>
      )}
      <div className="flex items-center justify-between gap-2">
        <p className="card-subtle text-sm text-emerald-100/80">{title}</p>
        <div className="flex items-center gap-1 text-emerald-100/60">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              online ? "animate-pulse bg-emerald-500" : "bg-rose-500"
            }`}
          />
          <SignalIcon strength={signalStrength} online={online} />
        </div>
      </div>
      <p
        className={`metric-reading mt-2 text-2xl font-semibold ${highlight ?? "text-emerald-300"}`}
      >
        {value}
      </p>
      <p className="card-subtle mt-2 flex items-center gap-1 overflow-hidden whitespace-nowrap text-xs text-emerald-100/65">
        <span className="truncate">Cập nhật: {updatedAt}</span>
        <span>·</span>
        <span>{online ? "Online" : "Offline"}</span>
      </p>
    </button>
  );
}

function SignalIcon({
  strength,
  online,
}: {
  strength: 1 | 2 | 3 | 4;
  online: boolean;
}) {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
      {[0, 1, 2, 3].map((index) => {
        const barHeight = (index + 1) * 3;
        const x = 1 + index * 4;
        const y = 15 - barHeight;
        const active = online && strength >= index + 1;
        return (
          <rect
            key={index}
            x={x}
            y={y}
            width="2.4"
            height={barHeight}
            rx="0.6"
            className={active ? "fill-emerald-500" : "fill-slate-300"}
          />
        );
      })}
    </svg>
  );
}

function ControlToggle({
  label,
  enabled,
  onToggle,
}: {
  label: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-xl border border-emerald-500/35 bg-[#0a1513]/65 px-3 py-2 text-left transition hover:border-emerald-300/70 hover:shadow-[0_0_12px_rgba(98,255,154,0.2)]"
    >
      <span className="text-sm font-medium text-emerald-100/90">{label}</span>
      <span
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
          enabled ? "bg-emerald-500" : "bg-[#28362f]"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-[#effff4] shadow-[0_0_12px_rgba(117,255,176,0.45)] transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}

function MetricHistoryChart({
  metric,
  data,
}: {
  metric: ChartMetricConfig;
  data: HistoryPoint[];
}) {
  if (data.length === 0) {
    return (
      <article className="rounded-2xl border border-emerald-500/30 bg-[#0a1513]/60 p-4">
        <p className="card-subtle text-sm text-emerald-100/80">
          Lịch sử {metric.label}
        </p>
        <p className="card-subtle mt-3 text-sm text-emerald-100/55">
          Chưa có dữ liệu lịch sử.
        </p>
      </article>
    );
  }

  const values = data.map((item) => metric.getValue(item));
  const labels = data.map((item) => item.timestamp);
  const minValue = Math.min(...values, metric.normalMin);
  const maxValue = Math.max(...values, metric.normalMax);
  const range = Math.max(maxValue - minValue, 0.001);

  return (
    <article className="mt-4 rounded-2xl border border-emerald-500/30 bg-[#071210]/65 p-4">
      <div className="card-subtle flex flex-wrap gap-x-4 gap-y-1 text-xs text-emerald-100/70">
        <p>
          {metric.label} hiện tại: {values[values.length - 1]} {metric.unit}
        </p>
        <p>
          Ngưỡng tốt: {metric.normalMin} - {metric.normalMax} {metric.unit}
        </p>
      </div>

      <ReactECharts
        style={{ height: 290, marginTop: 12 }}
        option={
          {
            animation: true,
            grid: {
              left: 16,
              right: 36,
              top: 24,
              bottom: 24,
              containLabel: true,
            },
            tooltip: {
              trigger: "axis",
              valueFormatter: (value) => `${value as number} ${metric.unit}`,
            },
            xAxis: {
              type: "category",
              boundaryGap: false,
              data: labels.map((time) => formatShortTime(time)),
              axisLabel: {
                color: "#90f3bc",
                fontSize: 10,
              },
              axisLine: {
                lineStyle: {
                  color: "rgba(114,255,179,0.35)",
                },
              },
            },
            yAxis: {
              type: "value",
              name: metric.unit,
              min: minValue - range * 0.08,
              max: maxValue + range * 0.08,
              axisLabel: {
                color: "#90f3bc",
                fontSize: 10,
              },
              splitLine: {
                lineStyle: {
                  color: "rgba(114,255,179,0.14)",
                  type: "dashed",
                },
              },
            },
            series: [
              {
                type: "line",
                name: metric.label,
                data: values,
                smooth: true,
                showSymbol: false,
                lineStyle: {
                  width: 3,
                  color: metric.color,
                },
                areaStyle: {
                  color: `${metric.color}26`,
                },
                markArea: {
                  silent: true,
                  itemStyle: {
                    color: "rgba(71,255,150,0.12)",
                  },
                  data: [
                    [{ yAxis: metric.normalMin }, { yAxis: metric.normalMax }],
                  ],
                },
              },
            ],
          } as EChartsOption
        }
      />
    </article>
  );
}

function SemiGauge({
  value,
  min,
  max,
}: {
  value: number;
  min: number;
  max: number;
}) {
  return (
    <ReactECharts
      style={{ height: 250 }}
      option={
        {
          series: [
            {
              type: "gauge",
              min,
              max,
              startAngle: 180,
              endAngle: 0,
              center: ["50%", "75%"],
              radius: "95%",
              progress: {
                show: true,
                width: 20,
                itemStyle: {
                  color: "#45ff9a",
                },
              },
              axisLine: {
                lineStyle: {
                  width: 20,
                  color: [[1, "#20352a"]],
                },
              },
              axisTick: {
                distance: -26,
                length: 8,
                lineStyle: {
                  color: "#5bffae",
                  width: 1,
                },
              },
              splitLine: {
                distance: -28,
                length: 14,
                lineStyle: {
                  color: "#39ff8b",
                  width: 2,
                },
              },
              axisLabel: {
                distance: -42,
                color: "#9dffc9",
                fontSize: 12,
              },
              pointer: {
                show: true,
                length: "55%",
                width: 4,
                showAbove: false,
              },
              anchor: {
                show: true,
                size: 10,
                itemStyle: {
                  color: "#48ff99",
                },
              },
              detail: {
                valueAnimation: true,
                offsetCenter: [0, "30%"],
                fontSize: 26,
                color: "#8dffc3",
                formatter: "{value}",
                z: 10,
              },
              title: {
                offsetCenter: [0, "48%"],
                color: "#8ed1ac",
                fontSize: 13,
                z: 10,
              },
              data: [{ value, name: "umol/m2/s" }],
            },
          ],
        } as EChartsOption
      }
    />
  );
}
