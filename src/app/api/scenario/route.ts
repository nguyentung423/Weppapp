import { setScenario } from "@/lib/services/greenhouseService";
import { ScenarioType } from "@/lib/types/domain";
import { fail, ok, readJsonBody } from "@/lib/api/http";

const ALLOWED_SCENARIO_MODES: ScenarioType[] = [
  "normal",
  "high_temperature",
  "ph_drift",
  "low_ec",
  "falling_water_level",
  "fan_failure",
  "pump_off_too_long",
];

export async function POST(request: Request) {
  const body = (await readJsonBody<{
    mode?: ScenarioType;
  }>(request)) ?? { mode: undefined };

  if (!body.mode || !ALLOWED_SCENARIO_MODES.includes(body.mode)) {
    return fail("INVALID_SCENARIO_MODE", "Mode kich ban khong hop le", 400, {
      allowedModes: ALLOWED_SCENARIO_MODES,
    });
  }

  try {
    const state = await setScenario(body.mode);
    return ok({ state });
  } catch {
    return fail("SCENARIO_UPDATE_FAILED", "Khong the cap nhat kich ban", 500);
  }
}
