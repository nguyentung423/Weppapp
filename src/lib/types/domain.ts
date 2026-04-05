export type Severity = "low" | "medium" | "high" | "critical";

export type ScenarioType =
  | "normal"
  | "high_temperature"
  | "ph_drift"
  | "low_ec"
  | "falling_water_level"
  | "fan_failure"
  | "pump_off_too_long";

export interface EnvironmentMetrics {
  lightIntensity: number; // umol/m2/s
  temperature: number; // celsius
  humidity: number; // percent
  co2: number; // ppm
}

export interface NutrientMetrics {
  ec: number; // mS/cm
  ph: number;
  waterLevel: number; // percent
}

export interface DeviceMetrics {
  pumpStatus: boolean;
  fanStatus: boolean;
  operatingTime: number; // minutes
}

export interface Reading {
  environment: EnvironmentMetrics;
  nutrient: NutrientMetrics;
  device: DeviceMetrics;
  timestamp: string;
}

export interface AlertItem {
  id: string;
  code: string;
  title: string;
  severity: Severity;
  explanation: string;
  recommendation: string;
  timestamp: string;
}

export interface ScenarioState {
  mode: ScenarioType;
  activeSince: string;
}

export interface GreenhouseState {
  current: Reading;
  scenario: ScenarioState;
  alerts: AlertItem[];
  stable: boolean;
}

export interface HistoryPoint {
  timestamp: string;
  temperature: number;
  ph: number;
  ec: number;
  waterLevel: number;
}
