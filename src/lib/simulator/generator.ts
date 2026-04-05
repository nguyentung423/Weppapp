import { Reading, ScenarioState } from "@/lib/types/domain";
import { clamp, randomNormal, round } from "@/lib/simulator/random";

const CADENCE_MS = {
  lightIntensity: 10_000,
  temperature: 15_000,
  humidity: 15_000,
  co2: 10_000,
  ec: 60_000,
  ph: 60_000,
  waterLevel: 30_000,
  deviceStatus: 30_000,
  operatingTime: 60_000,
};

type MetricClock = Record<keyof typeof CADENCE_MS, number>;

let metricClock: MetricClock | null = null;

function initMetricClock(now: number) {
  if (!metricClock) {
    metricClock = {
      lightIntensity: now,
      temperature: now,
      humidity: now,
      co2: now,
      ec: now,
      ph: now,
      waterLevel: now,
      deviceStatus: now,
      operatingTime: now,
    };
  }
}

function shouldUpdate(metric: keyof typeof CADENCE_MS, now: number): boolean {
  if (!metricClock) return true;
  return now - metricClock[metric] >= CADENCE_MS[metric];
}

function touch(metric: keyof typeof CADENCE_MS, now: number) {
  if (metricClock) metricClock[metric] = now;
}

function minutesSince(iso: string): number {
  const diffMs = Date.now() - new Date(iso).getTime();
  return Math.max(0, diffMs / 1000 / 60);
}

function evolve(current: number, target: number, alpha: number, noise: number) {
  return current + (target - current) * alpha + randomNormal(0, noise);
}

function buildNormalReading(previous: Reading): Reading {
  const now = Date.now();
  initMetricClock(now);

  let lightIntensity = previous.environment.lightIntensity;
  let temperature = previous.environment.temperature;
  let humidity = previous.environment.humidity;
  let co2 = previous.environment.co2;

  let ec = previous.nutrient.ec;
  let ph = previous.nutrient.ph;
  let waterLevel = previous.nutrient.waterLevel;

  let pumpStatus = previous.device.pumpStatus;
  let fanStatus = previous.device.fanStatus;
  let operatingTime = previous.device.operatingTime;

  if (shouldUpdate("lightIntensity", now)) {
    lightIntensity = round(
      clamp(evolve(lightIntensity, 340, 0.35, 9), 250, 430),
    );
    touch("lightIntensity", now);
  }

  if (shouldUpdate("temperature", now)) {
    temperature = round(clamp(evolve(temperature, 24.5, 0.28, 0.12), 21, 28));
    touch("temperature", now);
  }

  if (shouldUpdate("humidity", now)) {
    humidity = round(clamp(evolve(humidity, 66, 0.24, 0.45), 52, 76));
    touch("humidity", now);
  }

  if (shouldUpdate("co2", now)) {
    co2 = round(clamp(evolve(co2, 860, 0.32, 12), 700, 1100));
    touch("co2", now);
  }

  if (shouldUpdate("ec", now)) {
    ec = round(clamp(evolve(ec, 1.9, 0.22, 0.03), 1.6, 2.2));
    touch("ec", now);
  }

  if (shouldUpdate("ph", now)) {
    ph = round(clamp(evolve(ph, 6.1, 0.2, 0.02), 5.7, 6.4));
    touch("ph", now);
  }

  if (shouldUpdate("waterLevel", now)) {
    const drain = pumpStatus
      ? randomNormal(0.18, 0.07)
      : randomNormal(0.42, 0.1);
    waterLevel = round(clamp(waterLevel - drain, 45, 92));
    touch("waterLevel", now);
  }

  if (shouldUpdate("deviceStatus", now)) {
    pumpStatus = pumpStatus ? Math.random() > 0.005 : Math.random() > 0.35;
    fanStatus = fanStatus ? Math.random() > 0.005 : Math.random() > 0.35;
    touch("deviceStatus", now);
  }

  if (shouldUpdate("operatingTime", now)) {
    if (pumpStatus || fanStatus) {
      operatingTime += 1;
    }
    touch("operatingTime", now);
  }

  return {
    environment: {
      lightIntensity,
      temperature,
      humidity,
      co2,
    },
    nutrient: {
      ec,
      ph,
      waterLevel,
    },
    device: {
      pumpStatus,
      fanStatus,
      operatingTime,
    },
    timestamp: new Date().toISOString(),
  };
}

function applyScenario(reading: Reading, scenario: ScenarioState): Reading {
  const elapsed = minutesSince(scenario.activeSince);

  switch (scenario.mode) {
    case "high_temperature":
      return {
        ...reading,
        environment: {
          ...reading.environment,
          temperature: round(
            clamp(28.5 + elapsed * 1.3 + randomNormal(0, 0.2), 28, 39),
          ),
          humidity: round(clamp(reading.environment.humidity - 3.5, 35, 72)),
        },
      };
    case "ph_drift":
      return {
        ...reading,
        nutrient: {
          ...reading.nutrient,
          ph: round(
            clamp(6.45 + elapsed * 0.05 + randomNormal(0, 0.02), 6.45, 7.8),
          ),
        },
      };
    case "low_ec":
      return {
        ...reading,
        nutrient: {
          ...reading.nutrient,
          ec: round(
            clamp(1.5 - elapsed * 0.06 + randomNormal(0, 0.02), 0.7, 1.5),
          ),
        },
      };
    case "falling_water_level":
      return {
        ...reading,
        nutrient: {
          ...reading.nutrient,
          waterLevel: round(
            clamp(45 - elapsed * 2.1 + randomNormal(0, 0.35), 8, 45),
          ),
        },
      };
    case "fan_failure":
      return {
        ...reading,
        device: {
          ...reading.device,
          fanStatus: false,
        },
        environment: {
          ...reading.environment,
          temperature: round(
            clamp(reading.environment.temperature + 5.4, 28, 37),
          ),
          humidity: round(clamp(reading.environment.humidity + 3, 45, 85)),
        },
      };
    case "pump_off_too_long":
      return {
        ...reading,
        device: {
          ...reading.device,
          pumpStatus: false,
          operatingTime: reading.device.operatingTime + 4,
        },
        nutrient: {
          ...reading.nutrient,
          waterLevel: round(clamp(reading.nutrient.waterLevel - 2.8, 5, 92)),
        },
      };
    case "normal":
    default:
      return reading;
  }
}

export function simulateReading(
  previous: Reading,
  scenario: ScenarioState,
): Reading {
  const normal = buildNormalReading(previous);
  return applyScenario(normal, scenario);
}
