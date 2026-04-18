"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type EventItem = {
  time: string;
  message: string;
  level: "warning" | "system" | "status";
};

const EVENT_LOGS_STORAGE_KEY = "hydroponic.recentEvents";

function getLevelClass(level: EventItem["level"]) {
  if (level === "warning") return "text-orange-600";
  if (level === "status") return "text-emerald-700";
  return "text-slate-700";
}

export default function NhatKyPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<EventItem[]>([]);

  useEffect(() => {
    const loadLogs = () => {
      try {
        const raw = localStorage.getItem(EVENT_LOGS_STORAGE_KEY);
        if (!raw) {
          setLogs([]);
          return;
        }

        const parsed = JSON.parse(raw) as EventItem[];
        if (Array.isArray(parsed)) {
          setLogs(parsed);
        } else {
          setLogs([]);
        }
      } catch {
        setLogs([]);
      }
    };

    loadLogs();

    const interval = setInterval(loadLogs, 2000);
    const onStorage = (event: StorageEvent) => {
      if (event.key === EVENT_LOGS_STORAGE_KEY) {
        loadLogs();
      }
    };

    window.addEventListener("storage", onStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const groupedTitle = useMemo(() => {
    if (logs.length === 0) return "Nhật ký sự kiện";
    return `Nhật ký sự kiện (${logs.length})`;
  }, [logs]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-[0_4px_14px_rgba(15,23,42,0.04)] sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              {groupedTitle}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Lịch sử sự kiện được lưu cục bộ, sẵn sàng để nối backend.
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
        {logs.length === 0 ? (
          <p className="rounded-xl border border-slate-100 bg-white/80 px-4 py-3 text-sm text-slate-500">
            Chưa có sự kiện nào trong nhật ký.
          </p>
        ) : (
          <ul className="space-y-2">
            {logs.map((event, index) => (
              <li
                key={`${event.time}-${event.message}-${index}`}
                className="rounded-xl border border-slate-100 bg-white/80 px-4 py-3"
              >
                <p className="text-xs text-slate-500">[{event.time}]</p>
                <p className={`mt-0.5 text-sm ${getLevelClass(event.level)}`}>
                  {event.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
