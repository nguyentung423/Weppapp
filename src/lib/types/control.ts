export type ControlSource = "dashboard" | "openclaw" | "api";

export type PhAdjustmentMode = "ph_high" | "ph_low";

export type DeviceControlState = {
  waterPumpEnabled: boolean;
  nutrientPumpEnabled: boolean;
  growLightsEnabled: boolean;
  mistingEnabled: boolean;
  fanEnabled: boolean;
  fanSpeed: number; // 0-100
  co2PumpEnabled: boolean;
  curtainPercent: number; // 0-100
  updatedAt: string;
};

export type DeviceControlPatch = Partial<Omit<DeviceControlState, "updatedAt">>;

export type DeviceControlCommand = {
  source?: ControlSource;
  controls: DeviceControlPatch;
};

export type PhAdjustmentCommand = {
  source?: ControlSource;
  mode: PhAdjustmentMode;
  drops: number;
};

export type PhAdjustmentResult = {
  mode: PhAdjustmentMode;
  drops: number;
  source: ControlSource;
  previousPh: number;
  nextPh: number;
  delta: number;
  appliedAt: string;
};
