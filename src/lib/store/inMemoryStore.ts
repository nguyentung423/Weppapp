import { GreenhouseState, ScenarioType } from "@/lib/types/domain";

const nowIso = () => new Date().toISOString();

const defaultState: GreenhouseState = {
  current: {
    environment: {
      lightIntensity: 320,
      temperature: 24.2,
      humidity: 66,
      co2: 860,
    },
    nutrient: {
      ec: 1.9,
      ph: 6.1,
      waterLevel: 78,
    },
    device: {
      pumpStatus: true,
      fanStatus: true,
      operatingTime: 18,
    },
    timestamp: nowIso(),
  },
  scenario: {
    mode: "normal",
    activeSince: nowIso(),
  },
  alerts: [],
  stable: true,
};

let state: GreenhouseState = defaultState;

export const greenhouseStore = {
  getState(): GreenhouseState {
    return state;
  },
  setState(nextState: GreenhouseState) {
    state = nextState;
  },
  setScenario(mode: ScenarioType) {
    state = {
      ...state,
      scenario: {
        mode,
        activeSince: nowIso(),
      },
    };
  },
};
