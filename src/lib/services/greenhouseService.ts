import { answerAssistantQuestion } from "@/lib/logic/assistant";
import { evaluateReading, isStable } from "@/lib/logic/evaluator";
import { sendProactiveCriticalAlert } from "@/lib/integrations/telegramOpenClaw";
import { simulateReading } from "@/lib/simulator/generator";
import { historyStore } from "@/lib/store/historyStore";
import { greenhouseStore } from "@/lib/store/inMemoryStore";
import { controlStore } from "@/lib/store/controlStore";
import {
  fetchReadingHistory,
  persistAlerts,
  persistScenario,
  persistStateSnapshot,
} from "@/lib/supabase/repository";
import { AlertItem, HistoryPoint, ScenarioType } from "@/lib/types/domain";
import {
  DeviceControlCommand,
  DeviceControlPatch,
  DeviceControlState,
  PhAdjustmentCommand,
  PhAdjustmentResult,
} from "@/lib/types/control";

const SNAPSHOT_PERSIST_INTERVAL_MS = 30_000;
const ALERT_PERSIST_COOLDOWN_MS = 60_000;
const TELEGRAM_ALERT_COOLDOWN_MS = 300_000;
const SIMULATION_TICK_INTERVAL_MS = 300_000;
const SCENARIO_TRANSITION_DELAY_MS = 10_000;

let lastSnapshotPersistAt = 0;
const lastAlertPersistAtByCode = new Map<string, number>();
const lastTelegramAlertAtByCode = new Map<string, number>();
let simulationLoopStarted = false;
let freshTickInFlight: Promise<void> | null = null;

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
  void runSimulationTick().catch(() => {
    // Ignore first tick errors; next polling/tick will retry.
  });
  setInterval(() => {
    void runSimulationTick().catch(() => {
      // Keep simulation loop alive even when one tick fails.
    });
  }, SIMULATION_TICK_INTERVAL_MS);
}

export function ensureSimulationLoop() {
  startSimulationLoop();
}

async function ensureFreshReading() {
  const currentTimestamp = greenhouseStore.getState().current.timestamp;
  const staleForMs = Date.now() - new Date(currentTimestamp).getTime();

  if (staleForMs < SIMULATION_TICK_INTERVAL_MS) {
    return;
  }

  if (!freshTickInFlight) {
    freshTickInFlight = runSimulationTick()
      .then(() => undefined)
      .finally(() => {
        freshTickInFlight = null;
      });
  }

  await freshTickInFlight;
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function normalizeControlPatch(patch: DeviceControlPatch): DeviceControlPatch {
  const normalized: DeviceControlPatch = {};

  if (typeof patch.waterPumpEnabled === "boolean") {
    normalized.waterPumpEnabled = patch.waterPumpEnabled;
  }
  if (typeof patch.nutrientPumpEnabled === "boolean") {
    normalized.nutrientPumpEnabled = patch.nutrientPumpEnabled;
  }
  if (typeof patch.growLightsEnabled === "boolean") {
    normalized.growLightsEnabled = patch.growLightsEnabled;
  }
  if (typeof patch.mistingEnabled === "boolean") {
    normalized.mistingEnabled = patch.mistingEnabled;
  }
  if (typeof patch.fanEnabled === "boolean") {
    normalized.fanEnabled = patch.fanEnabled;
  }
  if (typeof patch.co2PumpEnabled === "boolean") {
    normalized.co2PumpEnabled = patch.co2PumpEnabled;
  }
  if (typeof patch.fanSpeed === "number" && Number.isFinite(patch.fanSpeed)) {
    normalized.fanSpeed = clampPercent(patch.fanSpeed);
  }
  if (
    typeof patch.curtainPercent === "number" &&
    Number.isFinite(patch.curtainPercent)
  ) {
    normalized.curtainPercent = clampPercent(patch.curtainPercent);
  }

  return normalized;
}

function applyControlsToCurrentState(controls: DeviceControlState) {
  const state = greenhouseStore.getState();
  greenhouseStore.setState({
    ...state,
    current: {
      ...state.current,
      device: {
        ...state.current.device,
        pumpStatus: controls.waterPumpEnabled,
        fanStatus: controls.fanEnabled,
      },
    },
  });
}

function clampPh(value: number): number {
  return Math.min(7.8, Math.max(4.8, Number(value.toFixed(2))));
}

function normalizePhDrops(drops: number): number {
  return Math.min(20, Math.max(1, Math.round(drops)));
}

export async function runSimulationTick() {
  const currentState = greenhouseStore.getState();
  const controls = controlStore.getState();
  const nextReading = simulateReading(
    currentState.current,
    currentState.scenario,
  );

  nextReading.device.pumpStatus = controls.waterPumpEnabled;
  nextReading.device.fanStatus = controls.fanEnabled;
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

  // Apply a short transition delay so scenario impact appears after ~10s.
  await new Promise<void>((resolve) => {
    setTimeout(() => resolve(), SCENARIO_TRANSITION_DELAY_MS);
  });

  return runSimulationTick();
}

export function getDeviceControls() {
  startSimulationLoop();
  return controlStore.getState();
}

export function applyDeviceControlCommand(command: DeviceControlCommand) {
  startSimulationLoop();
  const normalizedPatch = normalizeControlPatch(command.controls);

  if (Object.keys(normalizedPatch).length === 0) {
    throw new Error("INVALID_CONTROL_PATCH");
  }

  if (normalizedPatch.fanEnabled === false) {
    normalizedPatch.fanSpeed = 0;
  }
  if (normalizedPatch.fanEnabled === true && normalizedPatch.fanSpeed == null) {
    normalizedPatch.fanSpeed = 50;
  }

  const updatedControls = controlStore.patchState(normalizedPatch);
  applyControlsToCurrentState(updatedControls);

  return {
    controls: updatedControls,
    source: command.source ?? "api",
  };
}

export function applyPhAdjustmentCommand(
  command: PhAdjustmentCommand,
): PhAdjustmentResult {
  startSimulationLoop();

  const drops = normalizePhDrops(command.drops);
  const state = greenhouseStore.getState();
  const previousPh = state.current.nutrient.ph;
  const stepPerDrop = 0.04;
  const signedDelta =
    command.mode === "ph_high" ? -drops * stepPerDrop : drops * stepPerDrop;
  const nextPh = clampPh(previousPh + signedDelta);
  const nowIso = new Date().toISOString();

  const nextReading = {
    ...state.current,
    nutrient: {
      ...state.current.nutrient,
      ph: nextPh,
    },
    timestamp: nowIso,
  };

  const alerts = evaluateReading(nextReading);
  const stable = isStable(alerts);

  greenhouseStore.setState({
    ...state,
    current: nextReading,
    alerts,
    stable,
  });
  historyStore.push(nextReading);

  return {
    mode: command.mode,
    drops,
    source: command.source ?? "api",
    previousPh,
    nextPh,
    delta: Number((nextPh - previousPh).toFixed(2)),
    appliedAt: nowIso,
  };
}

export function getCurrentState() {
  startSimulationLoop();
  return greenhouseStore.getState();
}

export async function getCurrentStateFresh() {
  startSimulationLoop();
  await ensureFreshReading();
  return greenhouseStore.getState();
}

export function askAssistant(question: string) {
  return answerAssistantQuestion(question, greenhouseStore.getState());
}

export async function getHistory(windowMinutes: number) {
  startSimulationLoop();
  await ensureFreshReading();

  const current = greenhouseStore.getState().current;
  const currentPoint: HistoryPoint = {
    timestamp: current.timestamp,
    temperature: current.environment.temperature,
    humidity: current.environment.humidity,
    co2: current.environment.co2,
    ph: current.nutrient.ph,
    ec: current.nutrient.ec,
    waterLevel: current.nutrient.waterLevel,
  };
  const supabaseHistory = await fetchReadingHistory(windowMinutes);
  if (supabaseHistory.length > 0) {
    const merged = [...supabaseHistory, currentPoint]
      .filter(
        (point, index, array) =>
          index ===
          array.findIndex((item) => item.timestamp === point.timestamp),
      )
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
    return merged;
  }

  const sinceMs = Date.now() - windowMinutes * 60_000;
  const fallbackHistory = historyStore
    .getAll()
    .filter((reading) => new Date(reading.timestamp).getTime() >= sinceMs)
    .map(
      (reading): HistoryPoint => ({
        timestamp: reading.timestamp,
        temperature: reading.environment.temperature,
        humidity: reading.environment.humidity,
        co2: reading.environment.co2,
        ph: reading.nutrient.ph,
        ec: reading.nutrient.ec,
        waterLevel: reading.nutrient.waterLevel,
      }),
    );

  if (fallbackHistory.length > 0) {
    return fallbackHistory;
  }

  return [
    {
      timestamp: current.timestamp,
      temperature: current.environment.temperature,
      humidity: current.environment.humidity,
      co2: current.environment.co2,
      ph: current.nutrient.ph,
      ec: current.nutrient.ec,
      waterLevel: current.nutrient.waterLevel,
    },
  ] as HistoryPoint[];
}
