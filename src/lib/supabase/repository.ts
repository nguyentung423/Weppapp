import {
  AlertItem,
  GreenhouseState,
  HistoryPoint,
  ScenarioState,
} from "@/lib/types/domain";
import { env } from "@/lib/config/env";
import { getSupabaseClient } from "@/lib/supabase/client";

type SupabaseInsertable = {
  from: (table: string) => {
    insert: (values: unknown) => Promise<unknown>;
    upsert: (values: unknown) => Promise<unknown>;
  };
};

export async function persistStateSnapshot(state: GreenhouseState) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const db = supabase as unknown as SupabaseInsertable;

  const { current } = state;

  const payload = {
    timestamp: current.timestamp,
    light_intensity: current.environment.lightIntensity,
    temperature: current.environment.temperature,
    humidity: current.environment.humidity,
    co2: current.environment.co2,
    ec: current.nutrient.ec,
    ph: current.nutrient.ph,
    water_level: current.nutrient.waterLevel,
    pump_status: current.device.pumpStatus,
    fan_status: current.device.fanStatus,
    operating_time: current.device.operatingTime,
    stable: state.stable,
  };

  await db.from("readings").insert(payload);

  await db.from("current_state").upsert({
    id: "singleton",
    ...payload,
  });
}

export async function persistAlerts(alerts: AlertItem[]) {
  if (alerts.length === 0) return;

  const supabase = getSupabaseClient();
  if (!supabase) return;
  const db = supabase as unknown as SupabaseInsertable;

  const rows = alerts.map((alert) => ({
    id: alert.id,
    code: alert.code,
    title: alert.title,
    severity: alert.severity,
    explanation: alert.explanation,
    recommendation: alert.recommendation,
    timestamp: alert.timestamp,
  }));

  await db.from("alerts").insert(rows);
}

export async function persistScenario(scenario: ScenarioState) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const db = supabase as unknown as SupabaseInsertable;

  await db.from("scenario_state").upsert({
    id: "singleton",
    mode: scenario.mode,
    active_since: scenario.activeSince,
  });
}

export async function fetchReadingHistory(windowMinutes: number) {
  if (!env.hasSupabaseCredentials) {
    return [] as HistoryPoint[];
  }

  const sinceIso = new Date(Date.now() - windowMinutes * 60_000).toISOString();
  const params = new URLSearchParams({
    select: "timestamp,temperature,humidity,co2,ph,ec,water_level",
    order: "timestamp.asc",
    timestamp: `gte.${sinceIso}`,
    limit: String(windowMinutes <= 30 ? 120 : 480),
  });

  try {
    const response = await fetch(
      `${env.supabaseUrl}/rest/v1/readings?${params.toString()}`,
      {
        headers: {
          apikey: env.supabaseAnonKey,
          Authorization: `Bearer ${env.supabaseAnonKey}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return [] as HistoryPoint[];
    }

    const rows = (await response.json()) as Array<{
      timestamp: string;
      temperature: number;
      humidity: number;
      co2: number;
      ph: number;
      ec: number;
      water_level: number;
    }>;

    return rows.map((row) => ({
      timestamp: row.timestamp,
      temperature: row.temperature,
      humidity: row.humidity,
      co2: row.co2,
      ph: row.ph,
      ec: row.ec,
      waterLevel: row.water_level,
    }));
  } catch {
    return [] as HistoryPoint[];
  }
}
