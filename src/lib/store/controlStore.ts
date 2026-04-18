import { DeviceControlPatch, DeviceControlState } from "@/lib/types/control";

const nowIso = () => new Date().toISOString();

const defaultControls: DeviceControlState = {
  waterPumpEnabled: true,
  nutrientPumpEnabled: true,
  growLightsEnabled: true,
  mistingEnabled: true,
  fanEnabled: true,
  fanSpeed: 50,
  co2PumpEnabled: true,
  curtainPercent: 60,
  updatedAt: nowIso(),
};

let controlsState: DeviceControlState = defaultControls;

export const controlStore = {
  getState(): DeviceControlState {
    return controlsState;
  },
  patchState(patch: DeviceControlPatch): DeviceControlState {
    controlsState = {
      ...controlsState,
      ...patch,
      updatedAt: nowIso(),
    };
    return controlsState;
  },
};
