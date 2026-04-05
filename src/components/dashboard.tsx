"use client";

import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { GreenhouseState, ScenarioType } from "@/lib/types/domain";

type HistoryWindow = "30m" | "2h";

type HistoryPoint = {
  timestamp: string;
  temperature: number;
  ph: number;
  ec: number;
  waterLevel: number;
};

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

const QUICK_QUESTIONS = [
  "Nhiệt độ hiện tại là bao nhiêu?",
  "Nhà kính có ổn định không?",
  "Có điều kiện bất thường nào không?",
  "Vì sao pH bị cảnh báo?",
  "Tôi nên làm gì ngay bây giờ?",
];

const severityBadge: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-rose-100 text-rose-700",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString();
}

function formatShortTime(iso: string) {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getSeverityLabel(severity: string): string {
  switch (severity) {
    case "low":
      return "thấp";
    case "medium":
      return "trung bình";
    case "high":
      return "cao";
    case "critical":
      return "nghiêm trọng";
    default:
      return severity;
  }
}

export default function Dashboard() {
  const [state, setState] = useState<GreenhouseState | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [historyWindow, setHistoryWindow] = useState<HistoryWindow>("30m");
  const [question, setQuestion] = useState("");
  const [assistantAnswer, setAssistantAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchState = async () => {
    const response = await fetch("/api/state", { cache: "no-store" });
    const data = (await response.json()) as { state: GreenhouseState };
    setState(data.state);
  };

  const fetchHistory = async (window: HistoryWindow) => {
    const response = await fetch(`/api/history?window=${window}`, {
      cache: "no-store",
    });

    const data = (await response.json()) as {
      history: HistoryPoint[];
    };
    setHistory(data.history ?? []);
  };

  useEffect(() => {
    void fetchState();
    void fetchHistory(historyWindow);

    const timer = setInterval(() => {
      void fetchState();
      void fetchHistory(historyWindow);
    }, 3000);

    return () => clearInterval(timer);
  }, [historyWindow]);

  const onChangeScenario = async (mode: ScenarioType) => {
    setLoading(true);
    try {
      const response = await fetch("/api/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });

      const data = (await response.json()) as { state: GreenhouseState };
      setState(data.state);
      await fetchState();
      await fetchHistory(historyWindow);
    } finally {
      setLoading(false);
    }
  };

  const askAssistant = async (text: string) => {
    if (!text.trim()) return;

    const response = await fetch("/api/assistant/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: text }),
    });

    const data = (await response.json()) as { answer: string };
    setAssistantAnswer(data.answer);
  };

  const overviewTone = useMemo(() => {
    if (!state) return "bg-slate-200";
    return state.alerts.some((a) => a.severity === "critical")
      ? "bg-rose-100"
      : state.alerts.length > 0
        ? "bg-amber-100"
        : "bg-emerald-100";
  }, [state]);

  const historyCaption = historyWindow === "30m" ? "30 phút" : "2 giờ";

  if (!state) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-6 py-16">
        <p className="text-xl text-slate-700">
          Đang tải bảng điều khiển nhà kính...
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <section
        className={`${overviewTone} rounded-3xl border border-white/40 p-6 shadow-sm`}
      >
        <h1 className="font-display text-3xl tracking-tight text-slate-900">
          Trợ lý Nhà kính thủy canh
        </h1>
        <p className="mt-3 text-slate-700">
          Kịch bản: <strong>{SCENARIO_LABEL_MAP[state.scenario.mode]}</strong> ·
          Cập nhật lúc: <strong>{formatTime(state.current.timestamp)}</strong>
        </p>
        <p className="mt-1 text-slate-700">
          Trạng thái: {state.alerts.length === 0 ? "Ổn định" : "Cần chú ý"} (
          {state.alerts.length} cảnh báo đang hoạt động)
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Cường độ ánh sáng"
          value={`${state.current.environment.lightIntensity} umol/m2/s`}
        />
        <MetricCard
          title="Nhiệt độ"
          value={`${state.current.environment.temperature} °C`}
        />
        <MetricCard
          title="Độ ẩm"
          value={`${state.current.environment.humidity} %`}
        />
        <MetricCard
          title="CO2"
          value={`${state.current.environment.co2} ppm`}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard title="EC" value={`${state.current.nutrient.ec} mS/cm`} />
        <MetricCard title="pH" value={`${state.current.nutrient.ph}`} />
        <MetricCard
          title="Mực nước"
          value={`${state.current.nutrient.waterLevel} %`}
        />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl text-slate-900">
            Biểu đồ lịch sử
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
                    ? "border-teal-600 bg-teal-50 text-teal-700"
                    : "border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          Hiển thị xu hướng {historyCaption} gần nhất theo cách dễ nhìn: có
          ngưỡng tốt, xu hướng và cảnh báo rõ ràng.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <HistoryChart
            title="Nhiệt độ (°C)"
            color="#ea580c"
            data={history.map((item) => item.temperature)}
            labels={history.map((item) => item.timestamp)}
            unit="°C"
            normalMin={23}
            normalMax={27}
          />
          <HistoryChart
            title="pH"
            color="#0f766e"
            data={history.map((item) => item.ph)}
            labels={history.map((item) => item.timestamp)}
            unit=""
            normalMin={5.8}
            normalMax={6.3}
          />
          <HistoryChart
            title="EC (mS/cm)"
            color="#2563eb"
            data={history.map((item) => item.ec)}
            labels={history.map((item) => item.timestamp)}
            unit="mS/cm"
            normalMin={1.6}
            normalMax={2.2}
          />
          <HistoryChart
            title="Mực nước (%)"
            color="#7c3aed"
            data={history.map((item) => item.waterLevel)}
            labels={history.map((item) => item.timestamp)}
            unit="%"
            normalMin={40}
            normalMax={90}
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatusCard
          title="Trạng thái bơm"
          value={state.current.device.pumpStatus ? "BẬT" : "TẮT"}
        />
        <StatusCard
          title="Trạng thái quạt"
          value={state.current.device.fanStatus ? "BẬT" : "TẮT"}
        />
        <StatusCard
          title="Thời gian vận hành"
          value={`${state.current.device.operatingTime} min`}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-2xl text-slate-900">
            Cảnh báo và gợi ý
          </h2>
          {state.alerts.length === 0 ? (
            <p className="mt-4 rounded-2xl bg-emerald-50 p-4 text-emerald-700">
              Chưa phát hiện điều kiện bất thường.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {state.alerts.map((alert) => (
                <li
                  key={alert.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-slate-900">
                      {alert.title}
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${severityBadge[alert.severity]}`}
                    >
                      {getSeverityLabel(alert.severity)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">
                    {alert.explanation}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    Đề xuất: {alert.recommendation}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl text-slate-900">
              Điều khiển kịch bản
            </h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {SCENARIOS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  disabled={loading}
                  onClick={() => void onChangeScenario(item.value)}
                  className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                    state.scenario.mode === item.value
                      ? "border-teal-600 bg-teal-50 text-teal-700"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl text-slate-900">
              Trợ lý (sẵn sàng cho Telegram)
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    setQuestion(q);
                    void askAssistant(q);
                  }}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 hover:border-slate-300"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Hỏi về nhiệt độ, độ ổn định, pH, hành động cần làm..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-teal-500 focus:ring"
              />
              <button
                type="button"
                onClick={() => void askAssistant(question)}
                className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                Hỏi
              </button>
            </div>

            <div className="mt-4 min-h-24 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
              {assistantAnswer || "Câu trả lời của trợ lý sẽ hiển thị tại đây."}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </article>
  );
}

function StatusCard({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
    </article>
  );
}

function HistoryChart({
  title,
  data,
  labels,
  color,
  unit,
  normalMin,
  normalMax,
}: {
  title: string;
  data: number[];
  labels: string[];
  color: string;
  unit: string;
  normalMin: number;
  normalMax: number;
}) {
  if (data.length === 0) {
    return (
      <article className="rounded-2xl border border-slate-200 p-4">
        <p className="text-sm text-slate-500">{title}</p>
        <p className="mt-3 text-sm text-slate-400">Chưa có dữ liệu lịch sử.</p>
      </article>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(max - min, 0.001);

  const chartMin = Math.min(min, normalMin);
  const chartMax = Math.max(max, normalMax);
  const chartRange = Math.max(chartMax - chartMin, 0.001);

  const latest = data[data.length - 1];
  const latestLabel = labels[labels.length - 1];
  const anchorIndex = Math.max(0, data.length - 6);
  const trendDelta = latest - data[anchorIndex];
  const trendText =
    Math.abs(trendDelta) <= range * 0.08
      ? "Ổn định"
      : trendDelta > 0
        ? "Đang tăng"
        : "Đang giảm";

  const inNormalRange = latest >= normalMin && latest <= normalMax;
  const statusText = inNormalRange ? "Tốt" : "Cần kiểm tra";
  const statusClass = inNormalRange
    ? "bg-emerald-100 text-emerald-700"
    : "bg-amber-100 text-amber-700";

  const latestDisplay = unit ? `${latest} ${unit}` : `${latest}`;
  const normalRangeDisplay = unit
    ? `${normalMin} - ${normalMax} ${unit}`
    : `${normalMin} - ${normalMax}`;

  return (
    <article className="rounded-2xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {latestDisplay}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
        >
          {statusText}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
        <p>Ngưỡng tốt: {normalRangeDisplay}</p>
        <p>Xu hướng: {trendText}</p>
      </div>

      <ReactECharts
        style={{ height: 170, marginTop: 10 }}
        option={
          {
            animation: true,
            grid: {
              left: 16,
              right: 16,
              top: 10,
              bottom: 32,
              containLabel: true,
            },
            tooltip: {
              trigger: "axis",
              valueFormatter: (value) =>
                unit ? `${value as number} ${unit}` : `${value as number}`,
            },
            xAxis: {
              type: "category",
              boundaryGap: false,
              data: labels.map((time) => formatShortTime(time)),
              axisLabel: {
                color: "#64748b",
                fontSize: 10,
              },
              axisLine: {
                lineStyle: {
                  color: "#cbd5e1",
                },
              },
            },
            yAxis: {
              type: "value",
              min: (value) =>
                Math.min(value.min, normalMin) - chartRange * 0.05,
              max: (value) =>
                Math.max(value.max, normalMax) + chartRange * 0.05,
              axisLabel: {
                color: "#64748b",
                fontSize: 10,
              },
              splitLine: {
                lineStyle: {
                  color: "#e2e8f0",
                },
              },
            },
            dataZoom: [
              {
                type: "inside",
              },
            ],
            series: [
              {
                type: "line",
                data,
                smooth: true,
                showSymbol: false,
                lineStyle: {
                  width: 3,
                  color,
                },
                areaStyle: {
                  color: `${color}22`,
                },
                markArea: {
                  silent: true,
                  itemStyle: {
                    color: "rgba(34,197,94,0.12)",
                  },
                  data: [[{ yAxis: normalMin }, { yAxis: normalMax }]],
                },
              },
            ],
          } as EChartsOption
        }
      />

      <p className="mt-1 text-xs text-slate-400">
        Cập nhật gần nhất: {formatTime(latestLabel)}
      </p>
    </article>
  );
}
