import { answerAssistantQuestion } from "@/lib/logic/assistant";
import { evaluateReading, isStable } from "@/lib/logic/evaluator";
import { sendProactiveCriticalAlert } from "@/lib/integrations/telegramOpenClaw";
import { simulateReading } from "@/lib/simulator/generator";
import { historyStore } from "@/lib/store/historyStore";
import { greenhouseStore } from "@/lib/store/inMemoryStore";
import {
  fetchReadingHistory,
  persistAlerts,
  persistScenario,
  persistStateSnapshot,
} from "@/lib/supabase/repository";
import { AlertItem, HistoryPoint, ScenarioType } from "@/lib/types/domain";

const SNAPSHOT_PERSIST_INTERVAL_MS = 30_000;
const ALERT_PERSIST_COOLDOWN_MS = 60_000;
const TELEGRAM_ALERT_COOLDOWN_MS = 300_000;
const SIMULATION_TICK_INTERVAL_MS = 3_000;

let lastSnapshotPersistAt = 0;
const lastAlertPersistAtByCode = new Map<string, number>();
const lastTelegramAlertAtByCode = new Map<string, number>();
let simulationLoopStarted = false;

function filterByCooldown(
  alerts: AlertItem[],
  tracker: Map<string, number>,
  cooldownMs: number,
) {
  const now = Date.now();

  return alerts.filter((alert) => {
    const lastAt = tracker.get(alert.code) ?? 0;
    if (now - lastAt < cooldownMs) {
      return false;
    }

    tracker.set(alert.code, now);
    return true;
  });
}

function startSimulationLoop() {
  if (simulationLoopStarted) {
    return;
  }

  simulationLoopStarted = true;
  setInterval(() => {
    void runSimulationTick();
  }, SIMULATION_TICK_INTERVAL_MS);
}

export function ensureSimulationLoop() {
  startSimulationLoop();
}

export async function runSimulationTick() {
  const currentState = greenhouseStore.getState();
  const nextReading = simulateReading(
    currentState.current,
    currentState.scenario,
  );
  const alerts = evaluateReading(nextReading);
  const stable = isStable(alerts);

  const nextState = {
    ...currentState,
    current: nextReading,
    alerts,
    stable,
  };

  greenhouseStore.setState(nextState);
  historyStore.push(nextReading);

  const now = Date.now();
  if (now - lastSnapshotPersistAt >= SNAPSHOT_PERSIST_INTERVAL_MS) {
    await persistStateSnapshot(nextState);
    lastSnapshotPersistAt = now;
  }

  const alertsToPersist = filterByCooldown(
    alerts,
    lastAlertPersistAtByCode,
    ALERT_PERSIST_COOLDOWN_MS,
  );
  await persistAlerts(alertsToPersist);

  const criticalAlerts = alerts.filter(
    (alert) => alert.severity === "critical",
  );
  const criticalAlertsToPush = filterByCooldown(
    criticalAlerts,
    lastTelegramAlertAtByCode,
    TELEGRAM_ALERT_COOLDOWN_MS,
  );

  if (criticalAlertsToPush.length > 0) {
    await sendProactiveCriticalAlert(criticalAlertsToPush[0], nextState);
  }

  return nextState;
}

export async function setScenario(mode: ScenarioType) {
  startSimulationLoop();
  greenhouseStore.setScenario(mode);
  const state = greenhouseStore.getState();
  await persistScenario(state.scenario);
  return state;
}

export function getCurrentState() {
  startSimulationLoop();
  return greenhouseStore.getState();
}

export function askAssistant(question: string) {
  return answerAssistantQuestion(question, greenhouseStore.getState());
}

export async function getHistory(windowMinutes: number) {
  startSimulationLoop();
  const supabaseHistory = await fetchReadingHistory(windowMinutes);
  if (supabaseHistory.length > 0) {
    return supabaseHistory;
  }

  const sinceMs = Date.now() - windowMinutes * 60_000;
  const fallbackHistory = historyStore
    .getAll()
    .filter((reading) => new Date(reading.timestamp).getTime() >= sinceMs)
    .map(
      (reading): HistoryPoint => ({
        timestamp: reading.timestamp,
        temperature: reading.environment.temperature,
        ph: reading.nutrient.ph,
        ec: reading.nutrient.ec,
        waterLevel: reading.nutrient.waterLevel,
      }),
    );

  if (fallbackHistory.length > 0) {
    return fallbackHistory;
  }

  const current = greenhouseStore.getState().current;
  return [
    {
      timestamp: current.timestamp,
      temperature: current.environment.temperature,
      ph: current.nutrient.ph,
      ec: current.nutrient.ec,
      waterLevel: current.nutrient.waterLevel,
    },
  ] as HistoryPoint[];
}
